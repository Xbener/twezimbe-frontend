'use client'

import { useGetSingleChannel } from '@/api/channel'
import { GroupContext } from '@/context/GroupContext'
import { ChannelTypes, Message } from '@/types'
import { useParams } from 'next/navigation'
import React, { MouseEventHandler, useContext, useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { Lock, Bell, Pin, Smile, Image as Sticker, Plus, StickerIcon, DeleteIcon, Reply, Edit, ReplyAllIcon, XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import { useGetProfileData } from '@/api/auth'
import PacmanLoader from 'react-spinners/PacmanLoader'
import { socket, useMyContext } from '@/context/MyContext'
import { toast } from 'sonner'
import { throttle } from 'lodash'
import { Button } from '@/components/ui/button'

type Props = {}


function Page({ }: Props) {
    const { channelId } = useParams()
    const { messages, setMessages, isTyping, setIsTyping } = useMyContext()
    const { getChannel, isError } = useGetSingleChannel()
    const [isLoading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { currentUser } = useGetProfileData()
    const { group } = useContext(GroupContext)
    const [channel, setChannel] = useState<ChannelTypes | null>(null)
    const [message, setMessage] = useState<string>("")
    const editingInputRef = useRef<HTMLInputElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagingInputRef = useRef<HTMLInputElement | null>(null)
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

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            })
        }
    };

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
        console.log('Reply to message:', message._id);
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
    const handleStartEdit = (message: Message, content: string) => {
        if (editingInputRef.current) editingInputRef.current.focus()
        setIsEditing(prev => ({ content, state: true, message }))
    }

    const instantActions = [
        { name: "Reply", action: (msg: Message) => handleStartReplying(msg), icon: <Reply /> },
        { name: "Edit", action: (msg: Message, content?: string) => handleStartEdit(msg, content as string), icon: <Edit /> },
        { name: "Delete", action: (msg: Message) => handleDelete(msg), icon: <DeleteIcon /> },
    ]

    const getChatRoomData = async () => {
        try {
            const token = Cookies.get('access-token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${group?._id}/${channelId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },

            })
            const data = await response.json()
            setChannel(data.channel)
        } catch (error) {
            console.error('Error fetching data', error)
        } finally {
            setLoading(false)
        }
    }

    const getChannelMessages = async () => {
        try {
            const token = Cookies.get('access-token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel?.chatroom._id}`, {
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
        if (channelId) {
            getChatRoomData()
        }
    }, [channelId])

    useEffect(() => {
        if (channel) {
            getChannelMessages()
        }
    }, [channel])

    useEffect(() => {
        if (isTyping.message !== "") {
            socket.emit('is-typing', { message: isTyping.message, currentUser, receiver: channel?.members })
        }
    }, [isTyping.message])

    const sendBySendBtn = async (content: string) => {
        try {
            setSending(true)
            const token = Cookies.get('access-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel?.chatroom._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: currentUser?._id,
                    chatroom: channel?.chatroom?._id,
                    content: content,
                    messageType: "text",
                    attachmentUrl: "none",
                    receiver_id: channel?.members
                })
            });
            const data = await response.json();
            setMessages((prev: any) => ([...prev, { ...data.message, createdAt: new Date(), sender: currentUser, status: "sending" }]));
            socket.emit('new-message', { sender: currentUser, receiver: channel?.members, message: { ...data.message, sender: currentUser } })
            setMessage('')
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setSending(false)
        }
    }


    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && message.trim()) {
            try {
                setSending(true)
                const token = Cookies.get('access-token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/${channel?.chatroom._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender_id: currentUser?._id,
                        chatroom: channel?.chatroom?._id,
                        content: message,
                        messageType: "text",
                        attachmentUrl: "none",
                        receiver_id: channel?.members,
                        replyingTo: isReplying.state ? isReplying.message._id : null
                    })
                });
                const data = await response.json();
                setMessages((prev: any) => ([...prev, { ...data.message, createdAt: new Date(), sender: currentUser, replyedTo: isReplying.state ? isReplying.message : null }]));
                socket.emit('new-message', { sender: currentUser, receiver: channel?.members, message: { ...data.message, sender: currentUser, replyedTo: isReplying.state ? isReplying.message : null } })
                setMessage('')
                scrollToBottom();
                setIsReplying({ state: false, message: {}, replyingTo: "" })
            } catch (error) {
                console.error('Error sending message', error);
            } finally {
                setSending(false)
            }
        }
    }


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

    if (isLoading) return (
        <div className='w-full h-full grid place-content-center'>
            <PacmanLoader color='white w-2' size={'small'} />
        </div>
    )


    return (
        <div className="w-full h-screen flex flex-col bg-[#013a6fd3] text-white">
            {/* Header */}
            <div className="flex justify-between p-4 bg-[#013a6fae] border-b border-gray-700">
                <div className='flex items-center gap-2 capitalize text-[1.2rem] text-xl'>
                    <span>{channel?.state === 'public' ? '#' : <Lock />}</span>
                    <h1 className="text-base md:text-xl">{channel?.name}</h1>
                </div>
                <div className='flex items-center gap-4'>
                    <Bell className="cursor-pointer" />
                    <Pin className="cursor-pointer" />
                </div>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
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
                                        className={`flex gap-4 hover:bg-[#cbcbcb2e] cursor-pointer rounded-md items-start justify-normal p-1 ${index === msgs.length && "mb-5"} group`} // Reduced margin between consecutive messages
                                    >
                                        {showAvatarAndName ? (
                                            <Avatar className='w-[40px] h-[40px] bg-neutral-200 rounded-full'>
                                                <AvatarImage src={msg.sender?.profile_pic} />
                                                <AvatarFallback />
                                            </Avatar>
                                        ) : (
                                            <div className='w-[40px] text-[.5rem] items-center invisible group-hover:visible' >
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
                                                        <input
                                                            ref={editingInputRef}
                                                            disabled={sending}
                                                            className="flex-grow bg-gray-700 p-2 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed w-full"
                                                            value={isEditing.content}
                                                            onChange={(e) => setIsEditing(prev => ({ ...prev, content: e.target.value }))}
                                                            onKeyPress={handleEdit}
                                                        />
                                                        <Button onClick={() => setIsEditing({state:false, content:"", message:{}})} className="underline text-[.7rem]">cancel</Button>
                                                   </div>
                                        ) : (
                                        <div className='text-[#c4c4c4] text-[.9rem] w-full break-words p-0 m-0'>
                                            {msg?.replyedTo?.length! >= 1 || msg.replyedTo ? (
                                                <div className='bg-gray-800 p-2 rounded-md mb-1'>
                                                    <div className="flex items-center gap-2 overflow-hidden h-5 italic text-gray-300">
                                                        <ReplyAllIcon className="rotate-180" />
                                                        <span>{(msg.replyedTo?.length && msg?.replyedTo[0]?.content) || (msg.replyedTo && msg.replyedTo.content)}</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                            <div className="text-white">
                                                {msg.content}
                                                <span>{msg.edited && <span className='text-[.7rem] text-gray-200'>(edited)</span>}</span>
                                            </div>
                                        </div>

                                        )
                                            }
                                    </div>

                                        {/* Context Menu */ }
                                {
                                    contextMenu.visible && contextMenu.message?._id === msg._id && ( // Show the context menu for the correct message
                                        <div
                                            className="absolute bg-gray-700 text-white rounded-md shadow-sm w-[200px]"
                                            style={{ left: contextMenu.x, top: contextMenu.y }}
                                            onMouseLeave={closeContextMenu}
                                        >
                                            {instantActions.map((action, index) => {
                                                if ((action.name === "Edit" && `${msg.sender_id}` !== `${currentUser?._id}`) || (action.name === "Delete" && `${msg.sender_id}` !== `${currentUser?._id}`)) {
                                                    return null;
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
                                    </div>
                    );
                            })}

            </div>
            ))
                }
            <div ref={messagesEndRef} />
        </div>

            {/* Footer */ }
    <div className="bg-gray-800 p-4 border-t border-gray-700">
        {isReplying.state ? (
            <div className='w-full p-2 rounded-md '>
                <div className=" overflow-hidden h-5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ReplyAllIcon className="rotate-180" /> {isReplying.message.content}
                    </div>
                    <Button onClick={() => setIsReplying({ state: false, replyingTo: "", message: {} })}>
                        <XIcon />
                    </Button>
                </div>
            </div>
        ) : null}
        <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger>
                        <Plus className="cursor-pointer bg-neutral-50 text-gray-700 rounded-full" />
                    </PopoverTrigger>
                    <PopoverContent>

                    </PopoverContent>
                </Popover>

            </div>

            <input
                ref={messagingInputRef}
                disabled={sending}
                onBlur={() => setIsTyping(prev => ({ message: "" }))}
                onFocus={() => setIsTyping(prev => ({ ...prev, message: `${currentUser?.firstName} is typing ...` }))}
                className="flex-grow bg-gray-700 p-2 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                placeholder={`Message ${channel?.name}`}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);

                }}
                onKeyPress={handleKeyPress}
            />
            <div className="flex items-center gap-2">
                <Smile className="cursor-pointer hover:text-blue-400" />
                <StickerIcon className="cursor-pointer hover:text-blue-400" />
                <Sticker className="cursor-pointer hover:text-blue-400" />
            </div>
        </div>
        <div className='w-full h-1 text-[.7rem] p-1'>
            {/* {isTyping.message !== "" && isTyping.message} */}
        </div>
    </div>
        </div >
    )
}

export default Page
