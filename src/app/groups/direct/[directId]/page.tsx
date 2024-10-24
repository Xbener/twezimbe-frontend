'use client'
import { useParams } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { DMContext } from '@/context/DMContext'
import { ChatRoomTypes, Message, Reaction, User } from '@/types' // Assuming you have these types
import { AtSign, Bell, Bold, DeleteIcon, Edit, File, Italic, Link2, List, ListOrdered, Pin, Plus, Reply, ReplyAllIcon, SendHorizonal, SidebarClose, SidebarOpen, Smile, SmileIcon, Strikethrough, XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { data } from '@/components/charts/Applications'
import EmojiPicker from 'emoji-picker-react';
import { socket, useMyContext } from '@/context/MyContext'
import MainLoader from '@/components/MainLoader'

type Props = {}

function Page({ }: Props) {
    const { directId } = useParams()
    const [message, setMessage] = useState<string>("")
    const { setCurrentDM, currentUser, currentDM } = useContext(DMContext)
    const [currentPatners, setCurrentPatners] = useState<User[]>([])
    const currentUserId = Cookies.get('current-user-id') // Assuming you store the current user ID in cookies
    const { setRoomId, messages, setMessages } = useMyContext()
    const [sending, setSending] = useState(false)
    const [attachments, setAttachments] = useState<File[] | any>(null)
    const [isReplying, setIsReplying] = useState({
        state: false,
        replyingTo: "",
        message: {} as Message
    })


    const editingInputRef = useRef<HTMLInputElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagingInputRef = useRef<HTMLInputElement | null>(null)
    const emojiContainerRef = useRef<HTMLDivElement | null>(null)
    const [showPicker, setShowPicker] = useState(false);
    const [quickEmojiSelector, setQuickEmojiSelector] = useState(false)
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


    const handleEdit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            setRoomId(currentDM?._id!)
        } catch (error) {
            console.error('Error fetching data', error)
        }
    }


    useEffect(() => {
        if (currentDM) {
            getMessages()
        }
    }, [currentDM])

    useEffect(() => {
        setRoomId(currentDM?._id!)
    }, [currentDM])

    const handleStartEdit = (message: Message, content: string) => {
        if (editingInputRef.current) editingInputRef.current.focus()
        setIsEditing(prev => ({ content, state: true, message }))
    }


    const getChatRoomData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/${directId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                }
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors)

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
        setRoomId(currentDM?._id!)
    }, [currentDM])

    useEffect(() => {
        if (currentUser) {
            getChatRoomData()
        }
    }, [directId, currentUser])

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

    const sendBySendBtn = async (content: string) => {
        if (!currentDM) return;

        try {
            setSending(true);
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
                    content: content,
                    messageType: "text",
                    attachmentUrl: "none",
                    receiver_id: currentDM?.members, // Ensure you're sending to the right members
                })
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, status: "sending" }]);
            socket.emit('new-message', { sender: currentUser, chatroomId: currentDM?._id, sentTo: currentDM?._id, receiver: currentDM?.members, message: { ...data.message, sender: currentUser } });
            setMessage('');
            setRoomId(currentDM?._id!)
            scrollToBottom();
            setIsReplying({ state: false, message: {}, replyingTo: "" });
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && message.trim()) {
            if (!currentDM) return; // Make sure there's a channel context

            try {
                setSending(true);
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
                        content: message,
                        messageType: "text",
                        attachmentUrl: "none",
                        receiver_id: currentDM?.members, // Ensure you're sending to the right members
                        replyingTo: isReplying.state ? isReplying.message._id : null,
                    })
                });

                const data = await response.json();
                setMessages((prev) => [...prev, { ...data.message, createdAt: new Date(), sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null }]);
                socket.emit('new-message', { sender: currentUser, chatroomId: currentDM?._id, sentTo: currentDM?._id, receiver: currentDM?.members, message: { ...data.message, sender: currentUser, replyingTo: isReplying.state ? isReplying.message : null } });
                setMessage('');
                setRoomId(currentDM?._id!)
                scrollToBottom();
                setIsReplying({ state: false, message: {}, replyingTo: "" });
            } catch (error) {
                console.error('Error sending message', error);
            } finally {
                setSending(false);
            }
        }
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

    if (!messages.length) return (
        <div className="w-full h-full grid place-content-center ">
            loading ...
        </div>
    )

    return (
        <div className='w-full h-screen flex flex-col bg-[#013a6fd3] text-white'>
            <div className="flex justify-between p-4 bg-[#013a6fae] border-b border-gray-700 w-full">
                <div className='flex items-center gap-2 capitalize text-[1.2rem] text-xl'>
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
                                : 'No partners found'}
                        </h1>
                    )}
                </div>
                <div className='flex items-center gap-2'>
                    <Bell className="cursor-pointer" />
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
                    <span className="md:hidden block">
                        <SidebarOpen className="cursor-pointer" />
                    </span>
                </div>
            </div>


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

                                return (
                                    <div
                                        key={msg._id}
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
                                                                <input
                                                                    ref={editingInputRef}
                                                                    disabled={sending}
                                                                    className="flex-grow bg-transparent p-2 rounded-md text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed w-full"
                                                                    value={isEditing.content}
                                                                    onChange={(e) => setIsEditing(prev => ({ ...prev, content: e.target.value }))}
                                                                    onKeyPress={handleEdit}
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
                                                            {msg.content}
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
                                );
                            })}
                        </div>
                    ))
                }
                <div ref={messagesEndRef} />
            </div>


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
                        {/* <div className='w-auto p-2 flex flex-col items-center justify-center gap-2 border rounded-md'>
                            <span className='bg-neutral-50 text-black rounded-full place-self-end justify-self-end cursor-pointer'><XIcon /></span>
                            <FileIcon className=" size-12" />
                            <h1>filename.pdf</h1>
                        </div> */}
                    </div>
                ) : null}
                <div className="space-x-3 relative w-full">
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
                            <input
                                ref={messagingInputRef}
                                disabled={sending}
                                // onBlur={() => setIsTyping(prev => ({ message: "" }))}
                                // onFocus={() => setIsTyping(prev => ({ ...prev, message: `${currentUser?.firstName} is typing ...` }))}
                                className="flex-grow bg-transparent p-3 rounded-md text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed w-full"
                                placeholder={`Message ${currentPatners[0]?.lastName! || 'DM'}`}
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);

                                }}
                                onKeyPress={handleKeyPress}
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
                <div className='w-full h-1 text-[.7rem] p-1'>
                    {/* {isTyping.message !== "" && isTyping.message} */}
                </div>
            </div>
        </div>
    )
}

export default Page
