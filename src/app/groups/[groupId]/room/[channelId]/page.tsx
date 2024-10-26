'use client'

import { useGetSingleChannel } from '@/api/channel'
import { GroupContext } from '@/context/GroupContext'
import { ChannelSettings, ChannelTypes, Message, Reaction, UnreadMessage, User, UserSettings } from '@/types'
import { useParams } from 'next/navigation'
import React, { MouseEventHandler, useContext, useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { Lock, Bell, Pin, Smile, Image as Sticker, Plus, StickerIcon, DeleteIcon, Reply, Edit, ReplyAllIcon, XIcon, Settings, MessageCircleWarning, Delete, File, FileIcon, SmileIcon, Bold, Italic, Strikethrough, Link2, List, ListOrdered, AtSign, SidebarOpen, SendHorizonal, ArrowLeft, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import { useGetProfileData } from '@/api/auth'
import PacmanLoader from 'react-spinners/PacmanLoader'
import { socket, useMyContext } from '@/context/MyContext'
import { toast } from 'sonner'
import { throttle } from 'lodash'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialogHeader } from '@/components/ui/alert-dialog'
import data from '@emoji-mart/data'
import EmojiPicker from 'emoji-picker-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import addNotification from 'react-push-notification'
import ChatInput from '@/components/chatInput'
import { Input } from '@/components/ui/input'
import { InputSwitch } from 'primereact/inputswitch'


type Props = {}


function Page({ }: Props) {
    const params = useParams()
    const { messages, setMessages, isTyping, setIsTyping, unreadMessages, setUnreadMessages, roomIdRef, setCurrentChannel, setChId, userSettings, setUserSettings, setRoomId, roomId } = useMyContext()
    const { getChannel, isError } = useGetSingleChannel()
    const [isLoading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { currentUser } = useGetProfileData()
    const { group, setPrivateChannelMembers, setIsSideBarOpen, setIsMemberListOpen } = useContext(GroupContext)
    const [channel, setChannel] = useState<ChannelTypes | null>(null)
    const [message, setMessage] = useState<string>("")
    const editingInputRef = useRef<HTMLTextAreaElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagingInputRef = useRef<HTMLTextAreaElement | null>(null)
    const emojiContainerRef = useRef<HTMLDivElement | null>(null)
    const [showPicker, setShowPicker] = useState(false);
    const [quickEmojiSelector, setQuickEmojiSelector] = useState(false)
    const [attachments, setAttachments] = useState<File[] | any>(null)
    const [isMentioning, setIsMentioning] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [validUserNames, setValidUserNames] = useState<string[]>([])
    const [queriedMessages, setQueriedMessages] = useState<Message[]>([])
    const [settings, setSettings] = useState<ChannelSettings | null>(null)
    const [updatedSettings, setUpdatedSettings] = useState<ChannelSettings>({
        postPermission: 'anyone'
    })
    const [channelUpdateData, setChannelUpdateData] = useState({
        name: channel?.name,
        description: channel?.description,
        state: channel?.state

    })

    const [userRole, setUserRole] = useState<string>("ChannelMember")
    useEffect(() => {
        if (channel) {
            const thisUser = channel.membersDetails?.find((member: User) => member._id === currentUser?._id); // Replace with actual user ID
            if (thisUser?.role?.role_name) {
                setUserRole(thisUser.role.role_name);
            }
        }
    }, [channel]);

    useEffect(() => {

        const getSettings = async () => {

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/channel/${params?.channelId}`, {
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('access-token')}`
                    }
                })

                const data = await res.json()
                if (!data.status) return
                setSettings(data.channelSettings)
            } catch (error) {
                console.log('could not get settings', error)
            }
        }
        if (params.channelId) {
            getSettings()
        }
    }, [params])


    const handleUpdatedSettingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUpdatedSettings({ ...updatedSettings, [e.target.name]: e.target.value })
    }
    const updateSettings = async (updatedSettings: ChannelSettings) => {
        if (settings) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/channel/${settings._id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('access-token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...updatedSettings })
                })

                const data = await res.json()
                if (!data.status) toast.error(data.errors || data.message || "Unable to updated")
                window.location.reload()
            } catch (error) {
                console.log(error)
                toast.error('unable to update')
            }
        }
    }



    useEffect(() => {
        setValidUserNames(group?.members.map(member => `@${member.lastName}`) || [])
    }, [group])

    useEffect(() => {
        console.log(validUserNames)
    }, [validUserNames])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Match the mention syntax and capture the username after '@'
        const mentionMatch = value.match(/@(\w*)$/); // Allow for partial names
        if (mentionMatch) {
            setIsMentioning(true);
            const searchTerm = mentionMatch[1].toLowerCase();

            // If there's a search term, filter the members, otherwise show all
            setFilteredUsers(
                group?.members?.filter((user) =>
                    user.lastName.toLowerCase().startsWith(searchTerm) ||
                    user.firstName.toLowerCase().startsWith(searchTerm)
                ) || [] // Fallback to an empty array if no members are present
            );
        } else {
            setIsMentioning(false);
            setFilteredUsers([]);
            messagingInputRef?.current?.focus()
        }
    };


    const handleUserSelect = (user: User) => {
        const updatedMessage = message.replace(/@\w*$/, `@${user.lastName} `);
        setMessage(updatedMessage);
        setIsMentioning(false);
        setFilteredUsers([]);
    };


    useEffect(() => {
        if (channel) {
            setChannelUpdateData(prev => ({ ...prev, name: channel.name, description: channel.description, state: channel.state }))
        }
    }, [channel])

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setChannelUpdateData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleUpdateChannel = async () => {
        const token = Cookies.get('access-token')
        try {
            setSending(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${channel?._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({ ...channelUpdateData, members: channelUpdateData.state === 'public' && channel?.state === 'private' ? channel?.members : null })
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors)
            window.location.reload()
        } catch (error) {
            toast.error('something went wrong')
            console.log(error)
        } finally {
            setSending(false)
        }
    }


    const handleDeleteChannel = async () => {
        const token = Cookies.get('access-token')
        try {
            setSending(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${channel?._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors)
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${channel?.groupId}`
        } catch (error) {
            toast.error('something went wrong')
            console.log(error)
        } finally {
            setSending(false)
        }
    }

    const [isEditing, setIsEditing] = useState({
        state: false,
        content: "",
        message: {} as Message
    })

    const [isReplying, setIsReplying] = useState({
        state: false,
        replyingTo: "",
        message: {} as Message
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

    const handleRightClick = (event: React.MouseEvent) => {
        event.preventDefault();

        const { clientX, clientY } = event;

        // Get the height of the viewport
        const viewportHeight = window.innerHeight;
        const menuHeight = 150; // Assuming the height of the context menu

        // Calculate if there's enough space below the click point
        const spaceBelow = viewportHeight - clientY;

        // Determine new position based on available space
        const newY = spaceBelow < menuHeight ? clientY - menuHeight : clientY;

        setContextMenu({
            visible: true,
            x: clientX,
            y: newY,
            message: null,
        });
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
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleContextMenu = (e: any, msg: any) => {
        e.preventDefault(); // Prevent the default context menu from appearing
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            message: msg, // Store the clicked message
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
            socket.emit('delete-message', { message, receiver: channel?.members })
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
    const handleReply = (message: Message) => {
        // Implement reply logic here
        closeContextMenu();
    };
    const closeContextMenu = () => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            message: null, // Reset the message field to null
        });
    };


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
    const handleStartEdit = (message: Message, content: string) => {
        if (editingInputRef.current) editingInputRef.current.focus()
        setIsEditing(prev => ({ content, state: true, message }))
    }

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
            socket.emit('react-with-emoji', { msg, receiver: channel?.members, emoji, _id: currentUser?._id });

            // Update local state
            setMessages(prev => {
                return prev.map(prevMsg => {
                    if (prevMsg._id === msg?._id) {
                        const existingReactionIndex = prevMsg.reactions?.findIndex(r => r.emoji === emoji && r.user_id === currentUser?._id);

                        if (existingReactionIndex !== -1) {
                            // If the reaction exists, remove it
                            const newReactions = [...prevMsg.reactions as any];
                            newReactions.splice(existingReactionIndex!, 1); // Remove the reaction
                            socket.emit('remove-emoji', { msg, receiver: channel?.members, emoji, _id: currentUser?._id });
                            return { ...prevMsg, reactions: newReactions };
                        } else {
                            // If the reaction doesn't exist, add it
                            socket.emit('react-with-emoji', { msg, receiver: channel?.members, emoji, _id: currentUser?._id });
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


    const getChatRoomData = async () => {
        try {
            const token = Cookies.get('access-token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${group?._id}/${params?.channelId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: currentUser?._id })

            })
            const data = await response.json()
            if (!data.status) {
                return window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups`
            }
            setChannel(data.channel)
            setCurrentChannel(channel)
            setChId(channel?._id!)
            setMessages([]);
            setPrivateChannelMembers(channel?.membersDetails as User[])
            // setAdmins(data.channel.members.filter((member: any) => member.role === "ChannelAdmin"));
            // setModerators(data.members.filter((member: any) => member.role === "ChannelModerator"));
            // setMembers(data.members.filter((member: any) => member.role === "ChannelMember"));
        } catch (error) {
            console.error('Error fetching data', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setRoomId(channel?.chatroom?._id as string)
        console.log('chanel chantroom id', channel?.chatroom)
    }, [channel, params])

    useEffect(() => {
        const currentDMUnreadMessages = unreadMessages.filter(msg => msg?.chatroom?._id === channel?.chatroom?._id && !msg?.isRead!)
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
            // const timeout = setTimeout(() => {
            //     setUnreadMessages((prev: UnreadMessage[]) => {
            //         return prev.map((unreadmsg: UnreadMessage) => {
            //             if (unreadmsg?.chatroom?._id === channel?.chatroom?._id) return null
            //             return unreadmsg
            //         })
            //     })
            // }, 5000)

            // return () => clearTimeout(timeout)
        }
    }, [channel, params, roomId])

    const getChannelMessages = async () => {
        try {
            const token = Cookies.get('access-token')
            console.log("channel chatroom", channel)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel?.chatroom?._id}`, {
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
        getChatRoomData();
    }, [params]);


    useEffect(() => {
        const handleNewMessage = (vl: { message: Message }) => {
            setMessages((prev) => [...prev.filter(message => message._id !== vl.message._id), vl.message]);
            addNotification({
                title: 'New Message',
                subtitle: 'You have a new message',
                message: vl.message.content,
                theme: 'darkblue',
                native: true,
                onClick: () => window.focus()
            });
        };

        socket.on('new-message-added', handleNewMessage);

        return () => {
            socket.off('new-message-added', handleNewMessage); // Clean up listener on unmount
        };
    }, [params]);


    useEffect(() => {
        if (channel) {
            getChannelMessages()
        }
    }, [params, channel])

    useEffect(() => {
        if (isTyping.message !== "") {
            socket.emit('is-typing', { message: isTyping.message, currentUser, receiver: channel?.members })
        }
    }, [isTyping.message])

    const sendBySendBtn = async (content: string) => {
        if (!channel) return; // Make sure there's a channel context

        try {
            setSending(true);
            const token = Cookies.get('access-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel.chatroom?._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: currentUser?._id,
                    chatroom: channel.chatroom?._id,
                    content: content,
                    messageType: "text",
                    attachmentUrl: "none",
                    receiver_id: channel.members, // Ensure you're sending to the right members
                })
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, status: "sending" }]);
            socket.emit('new-message', { sender: currentUser, chatroomId: channel.chatroom?._id, sentTo: channel.chatroom?._id, receiver: channel.members, message: { ...data.message, sender: currentUser } });
            setMessage('');
            scrollToBottom();
            setIsReplying({ state: false, message: {}, replyingTo: "" });
            messagingInputRef?.current?.focus()
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === "Enter") {
            setMessage(prev => prev + '\n')
            return
        }
        if (e.key === 'Enter' && message.trim()) {
            if (!channel) return; // Make sure there's a channel context

            try {
                setSending(true);
                const token = Cookies.get('access-token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel.chatroom?._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender_id: currentUser?._id,
                        chatroom: channel.chatroom?._id,
                        content: message,
                        messageType: "text",
                        attachmentUrl: "none",
                        receiver_id: channel.members, // Ensure you're sending to the right members
                        replyingTo: isReplying.state ? isReplying.message._id : null,
                    })
                });

                const data = await response.json();
                setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null }]);
                socket.emit('new-message', { sender: currentUser, chatroomId: channel.chatroom?._id, sentTo: channel.chatroom?._id, receiver: channel.members, message: { ...data.message, sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null } });
                setMessage('');
                scrollToBottom();
                setIsReplying({ state: false, message: {}, replyingTo: "" });
                messagingInputRef?.current?.focus()
            } catch (error) {
                console.error('Error sending message', error);
            } finally {
                setSending(false);
            }
        }
    };



    // Group messages by date
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

    useEffect(() => {
        if (channel?.membersDetails) {
            setPrivateChannelMembers(channel?.membersDetails as User[])
        }
    }, [channel])

    useEffect(() => {
        groupedMessages = groupMessagesByDate(messages)
    }, [messages])

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

    const handleAddChannelMember = async (user: User) => {
        try {
            setSending(true)
            const token = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${channel?._id}/add-member`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user?._id, groupId: group?._id })
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors)
            setChannel(prev => ({ ...prev, members: [...prev?.members, user?._id] }))
            toast.success(data.message)
        } catch (error) {
            toast.error("Something went wrong")
            console.log(error)
        } finally {
            setSending(false)
        }
    }
    useEffect(() => {
        console.log(attachments)
    }, [attachments])
    if (isLoading) return (
        <div className='w-full h-full grid place-content-center'>
            <PacmanLoader color='white w-2' size={'small'} />
        </div>
    )
    const getFirstUnreadMessageId = (unreadMessages: UnreadMessage[]): string | undefined => {
        const firstUnreadMessage = unreadMessages.find((unreadMsg) => !unreadMsg?.isRead!);
        return firstUnreadMessage?.messageId;
    };

    const firstUnreadMessageId = getFirstUnreadMessageId(unreadMessages);

    const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQueriedMessages(messages.filter(message => message.content?.includes(e.target.value)))
    }

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

    const updateChannelUserRole = async (user_id: string, role_name: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/user-role`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ channel_id: channel?._id, user_id, role_name })
            })

            const data = await res.json()

            if (!data.status) return toast.error(data.errors || data.message || "Unable to update user role")
            toast.success("User role updated successfully")
            setPrivateChannelMembers((prev: User[])=> {
                return prev.map((member: User)=> {
                    if (member?._id === user_id) return {...member, role: {...member.role, role_name}}
                    return member
                })
            })
        } catch (error) {
            console.log(error)
            toast.error("unable to updated user role")
        }
    }
    return (
        <div className="w-full h-screen flex flex-col bg-[#013a6fd3] text-white">
            {/* Header */}
            <div className="flex justify-between p-4 bg-[#013a6fae] border-b border-gray-700">
                <div className='flex items-center gap-2 capitalize text-[1.2rem] text-xl'>
                    <span className="lg:hidden block" onClick={() => setIsMemberListOpen(true)}>
                        <ArrowLeft className="cursor-pointer" />
                    </span>
                    <span>{channel?.state === 'public' ? '#' : <Lock />}</span>
                    <h1 className="text-base md:text-xl">{channel?.name}</h1>
                </div>
                <div className='flex items-center gap-4'>
                    <Popover>

                        <PopoverTrigger>
                            <Bell className="cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-50 gap-1 flex flex-col pl-3 ">
                            <div className="w-full flex items-center justify-between">
                                <h1>Mute</h1>
                                <input
                                    type="checkbox"
                                    onChange={(e) =>
                                        handleUpdateUserSettings({
                                            ...userSettings,
                                            notificationSettings: {
                                                ...userSettings.notificationSettings,
                                                chatroomsMuted: e.target.checked
                                                    ? [...userSettings.notificationSettings.chatroomsMuted, `${channel?.chatroom?._id}`]
                                                    : userSettings.notificationSettings.chatroomsMuted.filter((chat) => chat !== channel?.chatroom?._id)
                                            }
                                        })
                                    }
                                    checked={userSettings?.notificationSettings.chatroomsMuted.includes(channel?.chatroom?._id!)}
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
                                messages && !messages.find(msg => msg.pinned) ? <span className='text-center'>no pinned messages</span> : messages.map((msg, index) => {
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
                    <Dialog>
                        <DialogTrigger>
                            <Settings className="cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="text-white bg-[#013a6f] shadow-2xl z-50 gap-1 flex flex-col pl-3 ">
                            <DialogHeader className="text-[1.2rem]">
                                {channel?.name} settings
                            </DialogHeader>

                            <div className='flex flex-col gap-2 mt-5 w-full'>
                                {
                                    (channel?.created_by?._id === currentUser?._id || userRole === 'ChannelAdmin') && (
                                        <div className='p-3 border-b flex items-start justify-around w-full flex-col'>
                                            <div className='w-full flex flex-col gap-2 items-end'>
                                                <div className="w-full flex flex-col gap-2">
                                                    <label className='font-extrabold text-[.8rem]' htmlFor="group_name">Channel name</label>
                                                    <input
                                                        id="name"
                                                        name="name"
                                                        value={channelUpdateData?.name}
                                                        onChange={handleUpdateChange}
                                                        className="bg-transparent p-2 border outline-none w-full" placeholder="Channel name" />
                                                </div>
                                                <div className="w-full flex flex-col gap-2">
                                                    <label className='font-extrabold text-[.8rem]' htmlFor="description">Channel description</label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        value={channelUpdateData?.description}
                                                        onChange={handleUpdateChange}
                                                        className="w-full bg-transparent p-2 border outline-none" placeholder="Channel description ..." />
                                                </div>

                                                <Select
                                                    defaultValue={channelUpdateData?.state}
                                                    onValueChange={(v) => setChannelUpdateData(prev => ({ ...prev, state: v }))}>
                                                    <SelectTrigger className="bg-transparent w-full text-white">
                                                        <SelectValue placeholder="Channel state" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        <SelectItem className="cursor-pointer" value="private">Private</SelectItem>
                                                        <SelectItem className="cursor-pointer" value="public">Public</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {/* {
                                groupData.group_type && (
                                    <input
                                        name="group_type"
                                        value={groupData?.group_type}
                                        onChange={handleChange}
                                        className="bg-transparent p-2 border outline-none w-full" placeholder="Justify Your answer" />
                                )
                            } */}

                                                <div>
                                                    <Button
                                                        disabled={sending}
                                                        onClick={handleUpdateChannel}
                                                        className='bg-blue-500 text-white'>Update</Button>
                                                </div>
                                            </div>

                                            <div className="mt-5 w-full">
                                                <h1 className="font-extrabold text-[.8rem]">Manage channel members</h1>

                                                <div className="mt-5 w-full">

                                                    <div className='flex w-full justify-between items-center'>
                                                        <h1>Who can message?</h1>

                                                        <div>
                                                            <Select
                                                                onValueChange={(v: 'admins' | 'anyone' | 'moderators') => {
                                                                    updateSettings({ postPermission: v })
                                                                }}
                                                                defaultValue={settings?.postPermission}>
                                                                <SelectTrigger className="bg-transparent w-full text-white">
                                                                    <SelectValue placeholder="Choose" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    <SelectItem className="cursor-pointer" value="anyone">Anyone</SelectItem>
                                                                    <SelectItem className="cursor-pointer" value="moderators">Moderators</SelectItem>
                                                                    <SelectItem className="cursor-pointer" value="admins">Admins</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className='flex w-full justify-between items-center mt-5'>
                                                        <h1>Change member roles</h1>

                                                        <Dialog>
                                                            <DialogTrigger>
                                                                <Button className="bg-blue-500">
                                                                    Change
                                                                </Button>

                                                            </DialogTrigger>
                                                            <DialogContent className="bg-white w-full">
                                                                <DialogHeader className="text-[1.1rem] ">
                                                                    Modify channel member role
                                                                </DialogHeader>
                                                                {
                                                                    channel?.membersDetails?.map((member: any) => {
                                                                        if (member?._id === channel?.created_by?._id || member?._id === currentUser?._id) return null
                                                                        return (
                                                                            <div className="w-full p-2 justify-between flex items-center  text-black">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Avatar className="w-[40px] h-[40px] bg-neutral-200 rounded-full">
                                                                                        <AvatarImage src={member?.profile_pic} />
                                                                                        <AvatarFallback />
                                                                                    </Avatar>
                                                                                    <h1>{member?.firstName} {member?.lastName}</h1>
                                                                                </div>
                                                                                <div>
                                                                                    <Select
                                                                                        defaultValue={member?.role?.role_name}
                                                                                        onValueChange={(v) => updateChannelUserRole(member?._id, v)}
                                                                                    >
                                                                                        <SelectTrigger className="bg-transparent w-full text-black">
                                                                                            <SelectValue placeholder="Change role" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="bg-white">
                                                                                            <SelectItem className="cursor-pointer" value="ChannelAdmin">Admin</SelectItem>
                                                                                            <SelectItem className="cursor-pointer" value="ChannelModerator">Moderator</SelectItem>
                                                                                            <SelectItem className="cursor-pointer" value="ChannelMember">Regular member</SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>

                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }
                                {((userRole === 'ChannelAdmin') && (channel?.state !== 'public')) && (
                                    <div className='flex w-full justify-between items-center border rounded-md p-2'>
                                        <h1>Add member </h1>
                                        <Dialog>
                                            <DialogTrigger disabled={sending}>
                                                <Button disabled={sending} className='bg-red-500 text-white flex items-center gap-1'>
                                                    <MessageCircleWarning />
                                                    Add
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-white text-black">
                                                <DialogHeader className="text-[1.3rem]">
                                                    {/* <Warn */}
                                                    Choose among the group members
                                                </DialogHeader>
                                                <div className="p-2">
                                                    {
                                                        group?.members.map((member, index) => {
                                                            // Check if the group member exists in channel members
                                                            const isMemberInChannel = channel?.members?.includes(member?._id);

                                                            if (!isMemberInChannel) {
                                                                // Render the member who is not in the channel
                                                                return (
                                                                    <div className="w-full flex items-center justify-between mb-2" key={member._id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="w-[40px] h-[40px] bg-neutral-200 rounded-full">
                                                                                <AvatarImage src={member?.profile_pic} />
                                                                                <AvatarFallback />
                                                                            </Avatar>
                                                                            <h1>{member?.firstName} {member?.lastName}</h1>
                                                                        </div>
                                                                        <Button onClick={() => handleAddChannelMember(member)} className="bg-blue-500 text-white">
                                                                            Add
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            }

                                                            return null; // Don't render anything if the member is already in the channel
                                                        })
                                                    }
                                                </div>
                                                <div>
                                                    <DialogClose>
                                                        <Button disabled={sending}>
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                                <div className='flex w-full justify-between items-center border rounded-md p-2'>
                                    <h1>Leave channel </h1>
                                    <Dialog>
                                        <DialogTrigger disabled={sending}>
                                            <Button disabled={sending} className='bg-red-500 text-white flex items-center gap-1'>
                                                <MessageCircleWarning />
                                                Leave
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white text-black">
                                            <DialogHeader>
                                                {/* <Warn */}
                                                Confirm Leaving this channel
                                            </DialogHeader>
                                            <div>
                                                <DialogClose>
                                                    <Button disabled={sending}>
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button disabled={sending} className="bg-red-500 text-white" >
                                                    Confirm
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {
                                    currentUser?._id === channel?.created_by?._id && (
                                        <div className='flex w-full justify-between items-center border border-red-500 rounded-md p-2 text-red-500'>
                                            <h1>Delete channel </h1>
                                            <Dialog>
                                                <DialogTrigger disabled={sending}>
                                                    <Button disabled={sending} className='bg-red-500 text-white flex items-center gap-1'>
                                                        <Delete />
                                                        Delete
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-white text-black">
                                                    <DialogHeader>
                                                        {/* <Warn */}
                                                        Confirm Deleting this channel
                                                    </DialogHeader>
                                                    <div>
                                                        <DialogClose>
                                                            <Button disabled={sending}>
                                                                Cancel
                                                            </Button>
                                                        </DialogClose>
                                                        <Button onClick={handleDeleteChannel} disabled={sending} className="bg-red-500 text-white" >
                                                            Confirm
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )
                                }
                            </div>
                        </DialogContent>
                    </Dialog>

                    <span className="lg:hidden block" onClick={() => setIsSideBarOpen(true)}>
                        <SidebarOpen className="cursor-pointer" />
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 overflow-x-hidden">
                {
                    messages.length <= 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            Start Conversation
                            <Button disabled={sending} className="bg-blue-500 disabled:cursor-not-allowed text-white"
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
                                            className={`flex w-full gap-4 hover:bg-[#cbcbcb2e] cursor-pointer rounded-md items-start mb-1 justify-normal ${index === msgs.length && "mb-5"} ${msg.pinned ? "bg-[rgba(255,193,59,0.42)]" : ' '} group `} // Reduced margin between consecutive messages
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

                                            <div className='flex flex-col w-full items-start justify-center '>
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
                                                                        value={isEditing.content}
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
                                                                <p>
                                                                    {msg?.content &&
                                                                        msg.content.split('\n').map((line, index) => (
                                                                            <span key={index}>
                                                                                {line.split(/(@\w+)/g).map((part, i) => {
                                                                                    const isMention = part.startsWith('@');
                                                                                    const username = part.slice(1); // Remove "@" for validation

                                                                                    // Check if it matches a valid username for highlighting
                                                                                    const isValidMention = isMention && validUserNames.includes(`@${username}`);

                                                                                    return (
                                                                                        <span
                                                                                            key={i}
                                                                                            style={{
                                                                                                backgroundColor: isValidMention ? 'rgba(255, 165, 0, 0.4)' : 'transparent', // Only highlight valid mentions
                                                                                                transition: 'background-color 0.3s ease',
                                                                                                padding: "5px",
                                                                                                borderRadius: '10px'
                                                                                            }}
                                                                                        >
                                                                                            {part}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                                {msg?.content && index < msg.content.split('\n').length - 1 && <br />}
                                                                            </span>
                                                                        ))}
                                                                </p>

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
                                                        className="absolute bg-gray-700 text-white rounded-md shadow-sm w-[200px] z-50"
                                                        style={{ left: contextMenu.x, top: contextMenu.y }}
                                                        onMouseLeave={closeContextMenu}
                                                    >
                                                        {instantActions.map((action, index) => {
                                                            if ((action.name === "Edit" && `${msg.sender_id}` !== `${currentUser?._id}`) || (action.name === "Delete" && `${msg.sender_id}` !== `${currentUser?._id}`)) {
                                                                return null;
                                                            }
                                                            if (action.name === "React") {
                                                                return (
                                                                    <div className="flex items-center w-full justify-around p-2">
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

            {/* Footer */}
            <div className="bg-gray-800 p-4 border-t border-gray-700 w-full flex flex-col">
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
                        {/* <div className='w-auto p-2 flex flex-col items-center justify-center gap-2 border rounded-md'>
                            <span className='bg-neutral-50 text-black rounded-full place-self-end justify-self-end cursor-pointer'><XIcon /></span>
                            <FileIcon className=" size-12" />
                            <h1>filename.pdf</h1>
                        </div> */}
                    </div>
                ) : null}
                <div className="space-x-3 relative w-full ">

                    {/* <ChatInput
                    channel={channel as ChannelTypes}
                    currentUser={currentUser}
                    handleKeyPress={handleKeyPress}
                    message={message}
                    sending={sending}
                    setAttachments={setAttachments}
                    setIsTyping={setIsTyping}
                    setMessage={setMessage}
                    /> */}
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
                        {isMentioning && (
                            <ul className="mention-dropdown absolute bg-white text-black w-1/2 rounded-md overflow-auto z-50 max-h-44 border-2 border-black shadow-md">
                                {filteredUsers.map((user) => (
                                    <>
                                        <li
                                            className="cursor-pointer hover:bg-gray-200 p-3"
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
                            <textarea
                                ref={messagingInputRef}
                                disabled={
                                    sending ||
                                    (settings?.postPermission.toLowerCase() === 'admins' && userRole !== 'ChannelAdmin') ||
                                    (settings?.postPermission.toLowerCase() === 'moderators' && userRole === 'ChannelMember')
                                }
                                onBlur={() => setIsTyping(prev => ({ message: "" }))}
                                onFocus={() => setIsTyping(prev => ({ ...prev, message: `${currentUser?.firstName} is typing ...` }))}
                                className="flex-grow bg-transparent p-3 rounded-md text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed w-full"
                                placeholder={
                                    (settings?.postPermission === 'admins' && userRole !== 'ChannelAdmin') ||
                                        (settings?.postPermission === 'moderators' && userRole === 'ChannelMember')
                                        ? "Not allowed to send messages"
                                        : `Message ${channel?.name}`
                                }
                                value={message}
                                onChange={handleChange}
                                onKeyDown={handleKeyPress}
                            />


                        </div>
                        <div className="w-full flex p-2">
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
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
                                            <Button className="flex items-center gap-2 hover:bg-[rgb(0,0,0,.5)]">
                                                <label className="flex items-center gap-2" htmlFor="attachment">
                                                    <File />
                                                    Upload a file
                                                </label>
                                            </Button>

                                        </PopoverContent>
                                    </Popover>
                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                        <Smile onClick={() => setShowPicker(prev => !prev)} className="size-5" />
                                    </span>
                                    <span className='p-1 font-bold hover:bg-gray-50 rounded-full cursor-pointer hover:text-neutral-700 duration-75'>
                                        <AtSign onClick={() => setShowPicker(prev => !prev)} className="size-5" />
                                    </span>
                                </div>

                                <Button
                                    onClick={() => sendBySendBtn(message)}
                                >
                                    <SendHorizonal />
                                </Button>
                            </div>

                            <div ref={emojiContainerRef} className="absolute z-50 bottom-9 right-0">
                                <EmojiPicker open={showPicker} onEmojiClick={(emoji) => {
                                    setMessage(prev => prev + emoji.emoji)
                                }} />
                            </div>

                        </div>

                    </div>


                </div>
                <div className='w-full h-1 text-[.7rem] p-1 flex justify-between'>
                    {/* {isTyping.message !== "" && isTyping.message} */}
                    <div></div>
                    <div className="text-[.6rem] flex gap-1">
                        <code className="rounded-md ">
                            ctrl+enter
                        </code>
                        for new line
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Page
