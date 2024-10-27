'use client'
import { useParams } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { DMContext } from '@/context/DMContext'
import { ChatRoomTypes, Message, Reaction, UnreadMessage, User, UserSettings } from '@/types' // Assuming you have these types
import { ArrowLeft, AtSign, Bell, Download, Bold, DeleteIcon, Edit, File, FileIcon, Italic, Link2, List, ListOrdered, Pin, Plus, Reply, ReplyAllIcon, Search, SendHorizonal, SidebarClose, SidebarOpen, Smile, SmileIcon, Strikethrough, XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { data } from '@/components/charts/Applications'
import EmojiPicker from 'emoji-picker-react';
import { socket, useMyContext } from '@/context/MyContext'
import MainLoader from '@/components/MainLoader'
import { GroupContext } from '@/context/GroupContext'
import { Editor, EditorState, Modifier } from 'draft-js';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { mimeTypeToSvg } from '@/constants'
import ChatInput from '@/components/chatInput'

type Props = {}

function Page({ }: Props) {
    const params = useParams()
    const [message, setMessage] = useState<string>("")
    const { setCurrentDM, currentUser, currentDM } = useContext(DMContext)
    const [currentPatners, setCurrentPatners] = useState<User[]>([])
    const currentUserId = Cookies.get('current-user-id') // Assuming you store the current user ID in cookies
    const { setRoomId, messages, setMessages, unreadMessages, roomId, roomIdRef, userSettings, setUserSettings } = useMyContext()
    const [sending, setSending] = useState(false)
    const { setIsSideBarOpen, setIsMemberListOpen } = useContext(GroupContext)
    const [attachments, setAttachments] = useState<File[] | any>(null)
    const [validUserNames, setValidUserNames] = useState<string[]>([])
    const [isReplying, setIsReplying] = useState({
        state: false,
        replyingTo: "",
        message: {} as Message
    })
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<typeof currentPatners>([]);

    const editingInputRef = useRef<HTMLTextAreaElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagingInputRef = useRef<HTMLTextAreaElement | null>(null)
    const emojiContainerRef = useRef<HTMLDivElement | null>(null)
    const [queriedMessages, setQueriedMessages] = useState<Message[]>([])
    const [showPicker, setShowPicker] = useState(false);
    const [quickEmojiSelector, setQuickEmojiSelector] = useState(false)
    const [isMentioning, setIsMentioning] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<typeof currentPatners>([]);
    const [fileUploading, setFileUploading] = useState({
        state: false,
        message: ""
    })
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        message: any | null; // Add the message object to the state
    }>({
        visible: false,
        x: 0,
        y: 0,
        message: null, // Initialize with null
    });

    const [isEditing, setIsEditing] = useState({
        state: false,
        content: "",
        message: {} as Message
    })

    useEffect(() => {
        setValidUserNames(currentDM?.memberDetails.map(member => `@${member.lastName}`) || [])
    }, [currentDM])


    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Check if the user is mentioning someone
        const mentionMatch = value.match(/@(\w*)$/); // Adjusted regex to capture more characters if needed
        if (mentionMatch) {
            setIsMentioning(true);

            const searchTerm = mentionMatch[1].toLowerCase();

            // If there's a search term, filter users; otherwise, show all users
            if (searchTerm) {
                setFilteredUsers(
                    currentPatners.filter((user) =>
                        user.lastName.toLowerCase().startsWith(searchTerm) ||
                        user.firstName.toLowerCase().startsWith(searchTerm)
                    )
                );
            } else {
                setFilteredUsers(currentPatners); // Show all users if searchTerm is empty
            }
        } else {
            setIsMentioning(false);
            setFilteredUsers([]);
            messagingInputRef?.current?.focus()
        }
    };


    const handleUpdateUserSettings = async (settings: UserSettings) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/user/${settings?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ ...settings })
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors || data.message || "Unable to update")
            setUserSettings(({ ...data.userSettings }))
        } catch (error) {
            toast.error('unable to updated')
            console.log(error)
        }
    }


    const handleUserSelect = (user: User) => {
        const updatedMessage = message.replace(/@\w*$/, `@${user.lastName} `);
        setMessage(updatedMessage);
        setIsMentioning(false);
        setFilteredUsers([]);
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            })
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target as Node)) {
            setShowPicker(false);
            setQuickEmojiSelector(false)
        }

    };
    useEffect(() => {
        if (params?.directId) {
            setRoomId(params.directId as string)
            roomIdRef.current = params.directId as string;
        }
    }, [params?.directId])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const closeContextMenu = () => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            message: null, // Reset the message field to null
        });
    };

    const handleDelete = async (message: Message) => {
        try {
            const token = Cookies.get('access-token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${message._id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (!res.ok) return toast.error("something went wrong")
            setMessages(prev => prev.filter(msg => msg._id !== message._id))
            socket.emit('delete-message', { message, receiver: currentDM?.members })
            closeContextMenu();
        } catch (error) {
            toast.error('something went wrong')
            console.log(error)
        }

    };

    const handleStartReplying = (message: Message) => {
        if (messagingInputRef.current) messagingInputRef.current.focus()
        setIsReplying(prev => ({ state: true, replyingTo: message._id!, message }))
    }


    const handleEdit = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === "Enter") {
            setIsEditing(prev => ({ ...prev, content: prev.content + '\n' }))
            return
        }
        if (e.key === 'Enter' && isEditing.content !== '') {
            const token = Cookies.get('access-token')
            setSending(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${isEditing?.message?._id}`, {
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: isEditing.content })
                })
                const data = await res.json()
                if (data.status) {
                    setMessages(prev => {
                        return prev.map(msg => msg._id === isEditing.message._id ? { ...msg, content: isEditing.content, edited: true, editedAt: new Date() } : msg)
                    })
                    setIsEditing(prev => ({ ...prev, state: false }))
                } else {
                    toast.error(data.errors)
                }
            } catch (error) {
                // toast.error('try again')
                console.log("error", error)
            } finally {
                setSending(false)
            }
        }
    }

    const handleContextMenu = (e: any, msg: any) => {
        e.preventDefault(); // Prevent the default context menu from appearing
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            message: msg, // Store the clicked message
        });
    };


    const handleReactWithEmoji = async (msg?: Message, emoji?: string) => {
        try {
            const token = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/add-reaction`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ messageId: msg?._id, userId: currentUser?._id, emoji }),
            });

            const data = await res.json();
            if (!data.status) return toast.error(data.errors);

            // Emit socket event for real-time updates
            socket.emit('react-with-emoji', { msg, receiver: currentDM?.members, emoji, _id: currentUser?._id });

            // Update local state
            setMessages(prev => {
                return prev.map(prevMsg => {
                    if (prevMsg._id === msg?._id) {
                        const existingReactionIndex = prevMsg.reactions?.findIndex(r => r.emoji === emoji && r.user_id === currentUser?._id);

                        if (existingReactionIndex !== -1) {
                            // If the reaction exists, remove it
                            const newReactions = [...prevMsg.reactions as any];
                            newReactions.splice(existingReactionIndex!, 1); // Remove the reaction
                            socket.emit('remove-emoji', { msg, receiver: currentDM?.members, emoji, _id: currentUser?._id });
                            return { ...prevMsg, reactions: newReactions };
                        } else {
                            // If the reaction doesn't exist, add it
                            socket.emit('react-with-emoji', { msg, receiver: currentDM?.members, emoji, _id: currentUser?._id });
                            return { ...prevMsg, reactions: [...(prevMsg.reactions || []), { user_id: currentUser?._id, emoji }] };
                        }
                    }
                    return prevMsg;
                });
            });
        } catch (error) {
            toast.error('unable to react');
            console.log(error);
        }
    };


    if (socket) {
        socket.on('react-with-emoji', ({ msg, emoji, _id }) => {
            setMessages(prev => {
                return prev.map(prevMsg => {
                    if (prevMsg._id === msg?._id) {
                        const existingReactionIndex = prevMsg.reactions?.findIndex(r => r.emoji === emoji && r.user_id === _id);

                        if (existingReactionIndex !== -1) {
                            // If the reaction exists, remove it
                            const newReactions = [...prevMsg.reactions as any];
                            newReactions.splice(existingReactionIndex!, 1);
                            return { ...prevMsg, reactions: newReactions };
                        } else {
                            // If the reaction doesn't exist, add it
                            return { ...prevMsg, reactions: [...(prevMsg.reactions || []), { user_id: _id, emoji }] };
                        }
                    }
                    return prevMsg;
                });
            });
        });
    }

    const getMessages = async () => {
        try {
            const token = Cookies.get('access-token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${currentDM?._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },

            })
            const data = await response.json()
            setMessages(data.messages)
        } catch (error) {
            console.error('Error fetching data', error)
        }
    }


    useEffect(() => {
        if (currentDM) {
            getMessages()
        }
    }, [currentDM])


    const handleStartEdit = (message: Message, content: string) => {
        if (editingInputRef.current) editingInputRef.current.focus()
        setIsEditing(prev => ({ content, state: true, message }))
    }


    const getChatRoomData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/${roomId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: currentUser?._id })
            })

            const data = await res.json()
            if (!data.status) {
                return window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups`
            }

            // Set the current DM in context
            setCurrentDM(data.chatroom)
            console.log('patners', data.chatroom.memberDetails, 'currentUser', currentUser)
            const partners = data.chatroom.memberDetails.filter((member: User) => member._id !== currentUser?._id)
            setCurrentPatners(partners)
        } catch (error) {
            toast.error("Failed to load chatroom")
            console.error(error)
        }
    }


    useEffect(() => {
        const currentDMUnreadMessages = unreadMessages.filter(msg => msg?.chatroom?._id === currentDM?._id && !msg?.isRead!)
        const markAsRead = async () => {
            currentDMUnreadMessages.forEach(async (message) => {
                await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/mark-as-read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Cookies.get('access-token')}`
                    },
                    body: JSON.stringify({ messageId: message?.messageId, userId: currentUser?._id }),
                });
            });
        }
        if (currentDMUnreadMessages) {
            markAsRead()
        }
    }, [currentDM, roomId])

    useEffect(() => {
        if (roomId) {
            getChatRoomData()
        }
    }, [roomId])

    const handlePin = async (msg: Message) => {
        try {
            const token = Cookies.get('access-token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/pin`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messageId: msg._id, pinned: msg.pinned })
            })
            setMessages(prev => {
                return prev.map(prevMsg => {
                    if (prevMsg._id === msg._id) return { ...prevMsg, pinned: !msg.pinned }
                    else return prevMsg
                })
            })
        } catch (error) {
            toast.error('something went wrong')
            console.log(error)
        }
    }

    const formatMessageDate = (date: Date) => {
        const msgDate = moment(date);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');

        if (msgDate.isSame(today, 'd')) {
            return `Today at ${msgDate.format('h:mm A')}`;
        } else if (msgDate.isSame(yesterday, 'd')) {
            return `Yesterday at ${msgDate.format('h:mm A')}`;
        } else {
            return msgDate.format('MM/DD/YYYY'); // Adjust this format as needed
        }
    };

    const instantActions = [{
        name: "React",
        action: (msg?: Message, emoji?: string) => handleReactWithEmoji(msg, emoji),
        icon: <SmileIcon />,
        emojis: ["👍", "😂", "❤️", "🔥", "😮"]
    },
    { name: "Reply", action: (msg: Message) => handleStartReplying(msg), icon: <Reply /> },
    { name: "Pin", action: (msg: Message) => handlePin(msg), icon: <Pin /> },
    { name: "Edit", action: (msg: Message, content?: string) => handleStartEdit(msg, content as string), icon: <Edit /> },
    { name: "Delete", action: (msg: Message) => handleDelete(msg), icon: <DeleteIcon /> },

    ];

    const uploadFiles = async () => {
        try {
            setAttachments([])
            setFileUploading(prev => ({ state: true, message: "File uploading" }));
            const formData = new FormData();

            // Append each file individually
            Array.from(attachments as File[]).forEach((file: File) => {
                formData.append('attachments', file);
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/upload-message-pictures`, {
                method: 'POST', // Specify the method
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                },
                body: formData
            });
            const data = await res.json()
            if (!data.status) return setFileUploading({ state: false, message: data.errors || data.message || "File upload failed" })
            return data.attachmentUrls
        } catch (error) {
            console.error('Error uploading files:', error);
            setFileUploading(prev => ({ state: false, message: "File upload failed" }));
        } finally {
            setFileUploading(prev => ({ state: false, message: "File upload completed" }));
        }
    }


    const sendMessage = async (content: string, fileUpload: any = null) => {
        if (!currentDM) return; // Ensure there's a channel context

        try {
            const token = Cookies.get('access-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${currentDM?._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: currentUser?._id,
                    chatroom: currentDM?._id,
                    content: content.trim(),
                    messageType: "text",
                    attachmentUrls: fileUpload || null,
                    receiver_id: currentDM?.members,
                    replyingTo: isReplying.state ? isReplying.message._id : null,
                })
            });

            const data = await response.json();
            setMessages(prev => [
                ...prev,
                { ...data.message, createdAt: new Date(), sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null }
            ]);
            socket.emit('new-message', { sender: currentUser, chatroomId: currentDM?._id, sentTo: currentDM?._id, receiver: currentDM?.members, message: { ...data.message, sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null } });

            // Reset the state
            setMessage('');
            setAttachments([]);
            scrollToBottom();
            setIsReplying({ state: false, message: {}, replyingTo: "" });
            messagingInputRef?.current?.focus();

        } catch (error) {
            console.error('Error sending message', error);
            // Optionally, display an error message to the user
        } finally {
            setSending(false);
        }
    };

    const sendBySendBtn = async (content: string) => {
        let fileUpload = null;
        if (attachments && attachments.length > 0) {
            fileUpload = await uploadFiles();
        }
        if (content.trim() || fileUpload) {
            setSending(true);
            await sendMessage(content, fileUpload);
        }
    };

    // const sendBySendBtn = async (content: string) => {
    //     // if (!currentDM) return;
    //     // if (message) {

    //         try {
    //             setSending(true);
    //             const token = Cookies.get('access-token');
    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${currentDM?._id}`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     sender_id: currentUser?._id,
    //                     chatroom: currentDM?._id,
    //                     content: content,
    //                     messageType: "text",
    //                     attachmentUrl: "none",
    //                     receiver_id: currentDM?.members, // Ensure you're sending to the right members
    //                 })
    //             });

    //             const data = await response.json();
    //             setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, status: "sending" }]);
    //             socket.emit('new-message', { sender: currentUser, chatroomId: currentDM?._id, sentTo: currentDM?._id, receiver: currentDM?.members, message: { ...data.message, sender: currentUser } });
    //             setMessage('');
    //             scrollToBottom();
    //             setIsReplying({ state: false, message: {}, replyingTo: "" });
    //             messagingInputRef?.current?.focus()
    //         } catch (error) {
    //             console.error('Error sending message', error);
    //         } finally {
    //             setSending(false);
    //         }
    //     // }
    // };

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === "Enter") {
            // Add a newline if Ctrl + Enter is pressed
            setMessage(prev => prev + '\n');
        } else if (e.key === 'Enter') {
            // Prevent the default behavior to avoid new lines when just Enter is pressed
            e.preventDefault();

            let fileUpload = null;
            if (attachments && attachments.length > 0) {
                fileUpload = await uploadFiles();
            }
            if (message.trim() || fileUpload) {
                setSending(true);
                await sendMessage(message, fileUpload);
            }
        }
    };


    // const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    //     if (e.ctrlKey && e.key === "Enter") {
    //         if (e.ctrlKey && e.key === "Enter") {
    //             setMessage(prev => prev + '\n')
    //             return
    //         }
    //     }
    //     if (e.key === 'Enter' && message.trim()) {
    //         if (!currentDM) return; // Make sure there's a channel context

    //         try {
    //             setSending(true);
    //             const token = Cookies.get('access-token');
    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${currentDM?._id}`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     sender_id: currentUser?._id,
    //                     chatroom: currentDM?._id,
    //                     content: message,
    //                     messageType: "text",
    //                     attachmentUrl: "none",
    //                     receiver_id: currentDM?.members, // Ensure you're sending to the right members
    //                     replyingTo: isReplying.state ? isReplying.message._id : null,
    //                 })
    //             });

    //             const data = await response.json();
    //             setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null }]);
    //             socket.emit('new-message', { sender: currentUser, chatroomId: currentDM?._id, sentTo: currentDM?._id, receiver: currentDM?.members, message: { ...data.message, sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null } });
    //             setMessage('');
    //             scrollToBottom();
    //             setIsReplying({ state: false, message: {}, replyingTo: "" });
    //             setSuggestions([]);
    //             messagingInputRef?.current?.focus()
    //         } catch (error) {
    //             console.error('Error sending message', error);
    //         } finally {
    //             setSending(false);
    //         }
    //     }
    // };

    const handleMentionClick = (mention: string) => {
        const mentionIndex = message.lastIndexOf('@');
        const newMessage = message.slice(0, mentionIndex) + mention + ' ';
        setMessage(newMessage);
        setShowSuggestions(false);
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groupedMessages: { [date: string]: Message[] } = {}
        if (messages) {

            messages.forEach((msg) => {
                const formattedDate = moment(msg.createdAt).format('MMMM D, YYYY')
                if (!groupedMessages[formattedDate]) {
                    groupedMessages[formattedDate] = []
                }
                groupedMessages[formattedDate].push(msg)
            })

        }
        return groupedMessages
    }

    let groupedMessages = groupMessagesByDate(messages)

    // if (!messages.length) return (
    //     <div className="w-full h-full grid place-content-center ">
    //         loading ...
    //     </div>
    // )

    const getFirstUnreadMessageId = (unreadMessages: UnreadMessage[]): string | undefined => {
        const firstUnreadMessage = unreadMessages.find((unreadMsg) => !unreadMsg?.isRead!);
        return firstUnreadMessage?.messageId;
    };

    const firstUnreadMessageId = getFirstUnreadMessageId(unreadMessages);


    const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQueriedMessages(messages.filter(message => message.content?.includes(e.target.value)))
    }

    const handleRemoveAttachment = (attachment: File) => {
        setAttachments(
            Array.from(attachments).filter((attached) => {
                // Assert that 'attached' is of type 'File'
                const fileAttached = attached as File;
                return fileAttached.name !== attachment.name;
            })
        );

    }
    return (
        <div className='w-full h-screen flex flex-col bg-[#013a6fd3] text-white'>
            {
                fileUploading.state && (
                    <div className="w-auto p-2 pl-5 pr-5 bg-blue-500 rounded-full shadow-lg text-white absolute left-1/2 mt-5">
                        file (s) uploading ...
                    </div>

                )
            }
            <div className="flex justify-between p-4 bg-[#013a6fae] border-b border-gray-700 w-full">
                <div className='flex items-center gap-2 capitalize text-[1.2rem] text-xl'>
                    <span className="lg:hidden block" onClick={() => setIsMemberListOpen(true)}>
                        <ArrowLeft className="cursor-pointer" />
                    </span>
                    {/* If there's only one partner, display their avatar and name */}
                    {currentPatners.length === 1 ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={currentPatners[0].profile_pic}
                                alt={`${currentPatners[0].firstName} ${currentPatners[0].lastName}`}
                                className="w-10 h-10 rounded-full"
                            />
                            <span>{currentPatners[0].firstName} {currentPatners[0].lastName}</span>
                        </div>
                    ) : (
                        // If there are multiple partners, display their names
                        <h1 className="text-base md:text-xl">
                            {currentPatners.length > 0
                                ? currentPatners.map((partner, index) => (
                                    <span key={partner._id}>
                                        {partner.firstName} {partner.lastName}{index < currentPatners.length - 1 ? ', ' : ''}
                                    </span>
                                ))
                                : ''}
                        </h1>
                    )}
                </div>
                <div className='flex items-center gap-2'>
                    <Popover>

                        <PopoverTrigger>
                            <Bell className="cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-50 flex flex-col pl-3 w-auto gap-3 ">
                            <div className="w-full flex items-center justify-between gap-5">
                                <label htmlFor="mute">{userSettings?.notificationSettings.chatroomsMuted.includes(currentDM?._id!) ? "Unmute" :'mute'}</label>
                                <input
                                    id='mute'
                                    name="mute"
                                    type="checkbox"
                                    onChange={(e) =>
                                        handleUpdateUserSettings({
                                            ...userSettings,
                                            notificationSettings: {
                                                ...userSettings.notificationSettings,
                                                chatroomsMuted: e.target.checked
                                                    ? [...userSettings.notificationSettings.chatroomsMuted, `${currentDM?._id}`]
                                                    : userSettings.notificationSettings.chatroomsMuted.filter((chat) => chat !== currentDM?._id)
                                            }
                                        })
                                    }
                                    checked={userSettings?.notificationSettings.chatroomsMuted.includes(currentDM?._id!)}
                                    className="p-5 w-5 h-5 cursor-pointer rounded-full "
                                />

                            </div>

                            <div className="w-full flex items-center justify-between gap-5">
                                <label htmlFor="block">{userSettings?.notificationSettings.chatroomsBlocked.includes(currentDM?._id!) ? "Unblock" : 'block'}</label>
                                <input
                                    id="block"
                                    name="mute"
                                    type="checkbox"
                                    onChange={(e) =>
                                        handleUpdateUserSettings({
                                            ...userSettings,
                                            notificationSettings: {
                                                ...userSettings.notificationSettings,
                                                chatroomsBlocked: e.target.checked
                                                    ? [...userSettings.notificationSettings.chatroomsBlocked, `${currentDM?._id}`]
                                                    : userSettings.notificationSettings.chatroomsBlocked.filter((chat) => chat !== currentDM?._id)
                                            }
                                        })
                                    }
                                    checked={userSettings?.notificationSettings.chatroomsBlocked.includes(currentDM?._id!)}
                                    className="p-5 w-5 h-5 cursor-pointer rounded-full "
                                />

                            </div>
                        </PopoverContent>
                    </Popover>
                    <Dialog>
                        <DialogTrigger>
                            <Search className="cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="bg-white p-2 flex flex-col">


                            <div className="w-full">
                                <Input
                                    className="w-full"
                                    onChange={handleMessageSearch}
                                    placeholder="Search by keyword ..."
                                />
                            </div>

                            <div className="mt-5 h-[500px] overflow-auto">
                                {
                                    !queriedMessages.length ? 'search messages ...' : (
                                        queriedMessages.map(message => {

                                            return (
                                                <div
                                                    className="w-full flex cursor-pointer hover:bg-gray-200 border-b rounded-md  p-2 flex-col"
                                                    key={message._id}>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className='w-[40px] h-[40px] bg-neutral-200 rounded-full'>
                                                            <AvatarImage src={message.sender?.profile_pic} />
                                                            <AvatarFallback />
                                                        </Avatar>

                                                        <div className="flex items-center gap-2">
                                                            <h1>{message.sender?.firstName} {message.sender?.lastName}</h1>
                                                            <p className="text-[.7rem]">{moment(message.createdAt).format('MMMM D, YYYY')}</p>
                                                        </div>
                                                    </div>

                                                    <p className="ml-11 text-gray-600">
                                                        {message.content}
                                                    </p>
                                                </div>
                                            )
                                        })
                                    )
                                }
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Popover>
                        <PopoverTrigger>
                            <Pin className="cursor-pointer" />
                        </PopoverTrigger>

                        <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-50 gap-1 flex flex-col pl-3 ">
                            {
                                !messages.find(msg => msg.pinned) ? <span className='text-center'>no pinned messages</span> : messages.map((msg, index) => {
                                    if (!msg.pinned) return null
                                    return <div
                                        key={msg._id}
                                        className={`flex flex-co gap-4 hover:bg-[#cbcbcb2e] cursor-pointer rounded-md items-start mb-1 justify-normal p-1 group`} // Reduced margin between consecutive messages
                                    >
                                        <span onClick={() => handlePin(msg)} className="border rounded-full p-2 hover:bg-neutral-50 hover:text-black duration-75">
                                            <Pin className='size-3' />
                                        </span>
                                        <div className='flex flex-col w-full items-start justify-center'>
                                            <div className="flex gap-2 items-center">
                                                <Avatar className='w-[40px] h-[40px] bg-neutral-200 rounded-full'>
                                                    <AvatarImage src={msg.sender?.profile_pic} />
                                                    <AvatarFallback />
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span>{msg?.sender?.lastName} {msg?.sender?.firstName}</span>
                                                    <span className="text-[.7rem] text-neutral-400">{formatMessageDate(msg?.createdAt as Date)}</span>
                                                </div>
                                            </div>
                                            <span className="p-2 w-full mt-1 rounded-md break-words text-wrap">
                                                {msg?.content?.slice(0, 100)}
                                            </span>
                                        </div>
                                    </div>
                                })
                            }
                        </PopoverContent>
                    </Popover>
                    <span className="lg:hidden block" onClick={() => setIsSideBarOpen(true)}>
                        <SidebarOpen className="cursor-pointer" />
                    </span>
                </div>
            </div>


            <div className="message-body flex-grow overflow-y-auto p-4 space-y-3 overflow-x-hidden ">
                {
                    messages.length <= 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            Start Conversation
                            <Button disabled={
                                sending||
                                userSettings?.notificationSettings.chatroomsBlocked.includes(currentDM?._id!)
                            } className="bg-blue-500 disabled:cursor-pointer z-50 text-white disabled:bg-gray-700"
                                onClick={() => {
                                    // setMessage("Hi!")
                                    sendBySendBtn("Hi!")
                                }}
                            >Say Hi!</Button>
                        </div>
                    )
                }
                {
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="text-neutral-400 text-sm my-2 text-center flex items-center">
                                <hr className="flex-grow border-t border-neutral-600" />
                                <span className="mx-2">{date}</span> {/* Margin added for spacing */}
                                <hr className="flex-grow border-t border-neutral-600" />
                            </div>


                            {msgs.map((msg, index) => {
                                const showAvatarAndName = index === 0 || msgs[index - 1]?.sender?._id !== msg?.sender?._id;
                                const isUnreadMessage = msg._id === firstUnreadMessageId;

                                const getFormattedMessageContent = () => {
                                    return msg.content! && msg?.content
                                        .split('\n')
                                        .map((line) =>
                                            line.split(/(@\w+)/g).map((part) => {
                                                const isMention = part.startsWith('@');
                                                const username = part.slice(1); // Remove "@" for validation
                                                const isValidMention = isMention && validUserNames.includes(`@${username}`);

                                                return isMention && isValidMention
                                                    ? `<span style="background-color: rgba(255, 165, 0, 0.4); padding: 5px; border-radius: 10px;">${part}</span>`
                                                    : part;
                                            }).join('') // Join parts of each line to keep formatting
                                        )
                                        .join('<br />'); // Add line breaks
                                };
                                return (
                                    <React.Fragment key={msg._id}>
                                        {isUnreadMessage && (
                                            <div className="w-full my-2 flex items-center">
                                                <hr className="flex-grow border-t border-red-500" />
                                                <span className="mx-2 text-red-500 text-xs">Unread Messages</span>
                                                <hr className="flex-grow border-t border-red-500" />
                                            </div>
                                        )}
                                        <div

                                            onContextMenu={(e) => handleContextMenu(e, msg)} // Pass the message to the context menu handler
                                            className={`flex gap-4 hover:bg-[#cbcbcb2e] cursor-pointer rounded-md items-start mb-1 justify-normal ${index === msgs.length && "mb-5"} ${msg.pinned ? "bg-[rgba(255,193,59,0.42)]" : ' '} group`} // Reduced margin between consecutive messages
                                        >
                                            {msg.pinned && <Pin />}
                                            {showAvatarAndName ? (
                                                <Avatar className=' bg-neutral-200 rounded-full'>
                                                    <AvatarImage src={msg.sender?.profile_pic} />
                                                    <AvatarFallback />
                                                </Avatar>
                                            ) : (
                                                <div className='w-[40px] p-0 h-0 text-[.5rem] items-center invisible group-hover:visible' >
                                                    {new Date(msg?.createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                            )}

                                            <div className='flex flex-col w-full items-start justify-center'>
                                                {showAvatarAndName && (
                                                    <div className="flex gap-2 items-center">
                                                        <span>{msg?.sender?.lastName} {msg?.sender?.firstName}</span>
                                                        <span className="text-[.7rem] text-neutral-400">{formatMessageDate(msg?.createdAt as Date)}</span>
                                                    </div>
                                                )}
                                                {
                                                    isEditing.state && isEditing.message._id === msg._id ? (
                                                        <div className="w-full flex flex-col items-start">
                                                            <div className="W-full flex flex-col border-gray-700 border focus-within:border-white rounded-md">
                                                                <div className='flex gap-2 group-focus-within:border-b-white border-b border-b-gray-500 p-2'>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <Bold className="size-5" />
                                                                    </span>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <Italic className="size-5" />
                                                                    </span>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <Strikethrough className="size-5" />
                                                                    </span>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <Link2 className="size-5" />
                                                                    </span>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <List className="size-5" />
                                                                    </span>
                                                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                        <ListOrdered className="size-5" />
                                                                    </span>

                                                                </div>
                                                                <div className="">
                                                                    <textarea
                                                                        ref={editingInputRef}
                                                                        disabled={sending}
                                                                        className="flex-grow bg-transparent p-2 rounded-md text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed w-full"
                                                                        value={isEditing.content.replace(/<\/?[^>]+(>|$)/g, "")}
                                                                        onChange={(e) => setIsEditing(prev => ({ ...prev, content: e.target.value }))}
                                                                        onKeyDown={handleEdit}
                                                                    />

                                                                </div>
                                                                <div className="w-full flex p-2">
                                                                    <div className="">
                                                                        <Popover>
                                                                            <PopoverTrigger className="p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75">
                                                                                <Plus className="size-5" />
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-50 gap-1 flex flex-col ">
                                                                                <input
                                                                                    type="file"
                                                                                    hidden
                                                                                    name="attachment"
                                                                                    id="attachment"
                                                                                    multiple
                                                                                    onChange={(e) => setAttachments(e.target.files as FileList)}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>

                                                                    </div>
                                                                    <div ref={emojiContainerRef} className="absolute z-50 bottom-9 right-0">
                                                                        <EmojiPicker open={showPicker} onEmojiClick={(emoji) => {
                                                                            setIsEditing(prev => ({ ...prev, content: prev.content + emoji.emoji }))
                                                                        }} />
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                                                            <Smile onClick={() => setShowPicker(prev => !prev)} className="size-5" />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Button onClick={() => setIsEditing({ state: false, content: "", message: {} })} className="underline text-[.7rem]">cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <div className='text-[#c4c4c4] text-[.9rem] w-[90%] break-words p-0 m-0'>
                                                            {msg.replyingTo ? (
                                                                <div className='bg-gray-800 p-2 rounded-md mb-1'>
                                                                    <div className="flex items-start justify-start gap-2 overflow-hidden italic text-gray-300 ">
                                                                        <ReplyAllIcon className="rotate-180" />
                                                                        <span>{(msg.replyingTo && msg.replyingTo.content?.slice(0, 150))}</span>
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                            <div className="text-white flex items-center gap-2">
                                                                <div className="w-full flex flex-col gap-2">
                                                                        <p
                                                                            dangerouslySetInnerHTML={{ __html: getFormattedMessageContent() }}
                                                                            style={{ transition: 'background-color 0.3s ease' }}
                                                                        />
                                                                    {
                                                                        msg.attachmentUrls && (
                                                                            <div className="w-full flex gap-2 flex-wrap">
                                                                                {msg.attachmentUrls.map((attachment, index) => {
                                                                                    const svgIcon = mimeTypeToSvg[attachment.type as any] || mimeTypeToSvg['default'];

                                                                                    // Check if the attachment is an image
                                                                                    if (attachment.type.startsWith('image/')) {
                                                                                        return (
                                                                                            <a
                                                                                                key={index}
                                                                                                href={attachment.url}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                download
                                                                                                className="hover:bg-[rgba(50,139,255,0.39)] p-3 rounded-md"
                                                                                            >
                                                                                                <div className="w-full flex items-center gap-2 justify-between group p-1 mb-5">
                                                                                                    <span className="text-[.7rem]">{attachment?.name.substr(0, 20)}</span>
                                                                                                    <button className="invisible group-hover:visible">
                                                                                                        <Download />
                                                                                                    </button>
                                                                                                </div>
                                                                                                <img
                                                                                                    key={index}
                                                                                                    className="object-fit rounded-md"
                                                                                                    src={attachment.url}
                                                                                                    alt="attachment"
                                                                                                    width={200}
                                                                                                    height={200}
                                                                                                />
                                                                                            </a>
                                                                                        );
                                                                                    } else {
                                                                                        // Render non-image files with SVG icon and download link
                                                                                        return (
                                                                                            <a
                                                                                                key={index}
                                                                                                href={attachment.url}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                download
                                                                                                className="hover:bg-[rgba(50,139,255,0.39)] p-3 rounded-md "
                                                                                            >
                                                                                                <div className="file-preview flex flex-col w-full justify-between group">
                                                                                                    <div className="w-full flex items-center gap-2 p-1 mb-5">
                                                                                                        <span className="text-[.7rem]">{attachment?.name.substr(0, 20)}</span>
                                                                                                        <button className="invisible group-hover:visible">
                                                                                                            <Download />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <img src={svgIcon} alt={attachment.type} width={100} height={100} className="mr-2" />
                                                                                                </div>
                                                                                            </a>
                                                                                        );
                                                                                    }
                                                                                })}
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                                <span>{msg.edited && <span className='text-[.7rem] text-gray-200'>(edited)</span>}</span>
                                                            </div>
                                                            <div className="flex items-center w-full justify-start p-1 gap-1">
                                                                {
                                                                    msg.reactions?.length! > 0 && (
                                                                        (() => {
                                                                            const emojiCounts = msg.reactions!.reduce((acc, reaction: Reaction) => {
                                                                                const emoji = reaction.emoji!;
                                                                                if (emoji !== '0') {
                                                                                    acc[emoji] = (acc[emoji] || 0) + 1;
                                                                                }
                                                                                return acc;
                                                                            }, {} as Record<string, number>);

                                                                            return Object.entries(emojiCounts).map(([emoji, count], index) => {
                                                                                // Check if the current user has reacted with this emoji
                                                                                const hasUserReacted = msg.reactions?.some(
                                                                                    (reaction) => reaction.emoji === emoji && reaction.user_id === currentUser?._id
                                                                                );

                                                                                return (
                                                                                    <span
                                                                                        key={index}
                                                                                        // If the user has reacted, add a background color
                                                                                        className={`${hasUserReacted ? "bg-[rgba(255,255,255,0.19)] " : ""
                                                                                            } border p-1 rounded-md hover:bg-[rgba(255,255,255,0.24)] cursor-pointer`}
                                                                                        onClick={() => handleReactWithEmoji(msg, emoji)} // Add react/remove logic here
                                                                                    >
                                                                                        {emoji} {count > 1 && <span className="ml-1">x{count}</span>}
                                                                                    </span>
                                                                                );
                                                                            });
                                                                        })()
                                                                    )
                                                                }

                                                            </div>

                                                        </div>
                                                    )
                                                }
                                            </div>

                                            {/* Context Menu */}
                                            {
                                                contextMenu.visible && contextMenu.message?._id === msg._id && ( // Show the context menu for the correct message
                                                    <div
                                                        className="absolute bg-gray-700 text-white rounded-md shadow-sm w-auto p-1 z-50"
                                                        style={{ left: contextMenu.x, top: contextMenu.y }}
                                                        onMouseLeave={closeContextMenu}
                                                    >
                                                        {instantActions.map((action, index) => {
                                                            if ((action.name === "Edit" && `${msg.sender_id}` !== `${currentUser?._id}`) || (action.name === "Delete" && `${msg.sender_id}` !== `${currentUser?._id}`)) {
                                                                return null;
                                                            }
                                                            if (action.name === "React") {
                                                                return (
                                                                    <div className="flex items-center w-full justify-around p-2 gap-1">
                                                                        {
                                                                            action.emojis!.map((emoji, index) => (
                                                                                <span key={index} className="border p-1 rounded-md hover:bg-[rgba(255,255,255,0.24)] cursor-pointer"
                                                                                    onClick={() => handleReactWithEmoji(msg, emoji)}>
                                                                                    {emoji}
                                                                                </span>
                                                                            ))
                                                                        }

                                                                        <span className="border p-1 rounded-md hover:bg-[rgba(255,255,255,0.24)] cursor-pointer"
                                                                            onClick={() => setQuickEmojiSelector(prev => !prev)}
                                                                        >
                                                                            <SmileIcon />
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                            if (action.name === "Pin" && msg.pinned) {
                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        className={`w-full text-left p-2 hover:bg-blue-600 ${action.name === "Pin" ? "text-orange-500" : ""} flex items-center gap-2`}
                                                                        onClick={() => {
                                                                            if (action.name === "Edit") {
                                                                                action.action(msg, msg.content);
                                                                            } else {
                                                                                action.action(msg);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {action.icon}
                                                                        Unpin
                                                                    </button>
                                                                )
                                                            }

                                                            return (
                                                                <button
                                                                    key={index}
                                                                    className={`w-full text-left p-2 hover:bg-blue-600 ${action.name === "Delete" ? "text-red-500 hover:text-white hover:bg-red-500" : ""} flex items-center gap-2`}
                                                                    onClick={() => {
                                                                        if (action.name === "Edit") {
                                                                            action.action(msg, msg.content);
                                                                        } else {
                                                                            action.action(msg);
                                                                        }
                                                                    }}
                                                                >
                                                                    {action.icon}
                                                                    {action.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                            }
                                            <div ref={emojiContainerRef} className="absolute z-50 bottom-9 right-5">
                                                <EmojiPicker open={quickEmojiSelector} onEmojiClick={(emoji) => {
                                                    handleReactWithEmoji(msg, emoji.emoji)
                                                    setQuickEmojiSelector(false)
                                                }} />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ))
                }
                <div ref={messagesEndRef} />
            </div>


           {
                userSettings?.notificationSettings.chatroomsBlocked.includes(currentDM?._id!) ? (
                   <div className="W-full p-2 text-center">
                    You blocked this profile 
                   </div>
                ) : (
                        <div className="bg-gray-800 p-4 border-t border-gray-700 w-full">
                            {isReplying.state ? (
                                <div className='w-full p-2 rounded-md '>
                                    <div className=" overflow-hidden flex items-center justify-between gap-2">
                                        <div className="flex items-start justify-normal text-[.7rem] gap-2">
                                            <ReplyAllIcon className="rotate-180" /> {isReplying.message.content?.slice(0, 150)}
                                        </div>
                                        <Button onClick={() => setIsReplying({ state: false, replyingTo: "", message: {} })}>
                                            <XIcon />
                                        </Button>
                                    </div>
                                </div>
                            ) : attachments?.length ? (
                                <div className='w-full h-auto p-2 flex gap-2 overflow-auto flex-wrap'>
                                    {Array.from(attachments as File[]).map((file: File, index: number) => (
                                        <div key={index} className='w-[100px] overflow-hidden p-2 flex flex-col items-center justify-center gap-2 border rounded-md'>
                                            <button

                                                className='bg-neutral-50 text-black rounded-full place-self-end justify-self-end cursor-pointer'
                                                onClick={() => handleRemoveAttachment(file)}
                                            >
                                                <XIcon />
                                            </button>
                                            <FileIcon className="size-12" />
                                            <h1>{file.name}</h1>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            <div className="space-x-3 relative w-full">
                                <div className="W-full flex flex-col border-gray-700 border focus-within:border-white rounded-md">
                                   
                                    {isMentioning && (
                                        <ul className="mention-dropdown absolute bg-blue-500 text-white w-1/5 rounded-md overflow-auto z-50 max-h-44  shadow-md">
                                            {filteredUsers.map((user) => (
                                                <>
                                                    <li
                                                        className="cursor-pointer hover:bg-gray-200 hover:text-black p-3"
                                                        key={user.id}
                                                        onClick={() => {
                                                            handleUserSelect(user)
                                                            messagingInputRef?.current?.focus()

                                                        }}>
                                                        @{user.lastName} {user.firstName}
                                                    </li>
                                                </>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="relative">

                                        <ChatInput
                                            setAttachments={setAttachments}
                                            sendMessage={sendMessage}
                                            filesAttached={(attachments && attachments.length) > 0 ? true : false}
                                            placeholder={currentPatners.length >0 ? `message ${currentPatners[1]?.lastName} ...` : "Send DM..."}
                                            disabled={sending || fileUploading.state}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                )
           }
        </div>
    )
}

export default Page
