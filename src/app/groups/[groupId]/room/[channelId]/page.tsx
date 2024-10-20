'use client'

import { useGetSingleChannel } from '@/api/channel'
import { GroupContext } from '@/context/GroupContext'
import { ChannelTypes, Message } from '@/types'
import { useParams } from 'next/navigation'
import React, { MouseEventHandler, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Lock, Bell, Pin, Smile, Image as Sticker, Plus, StickerIcon, DeleteIcon, Reply } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import { useGetProfileData } from '@/api/auth'

type Props = {}


function Page({ }: Props) {
    const { channelId } = useParams()
    const { getChannel, isError, isLoading } = useGetSingleChannel()
    const { currentUser } = useGetProfileData()
    const { group } = useContext(GroupContext)
    const [channel, setChannel] = useState<ChannelTypes | null>(null)
    const [message, setMessage] = useState<string>("")
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
        visible: false,
        x: 0,
        y: 0,
    });
    const [messages, setMessages] = useState<Message[]>([

    ])

    const handleContextMenu = (e: any) => {
        e.preventDefault(); // Prevent the default context menu from appearing
        setContextMenu({ visible: true, x: e.pageX, y: e.pageY });
    };

    const handleDelete = (message: Message) => {
        console.log('Delete message:', message._id);
        // Implement delete logic here
        closeContextMenu();
    };

    const handleReply = (message: Message) => {
        console.log('Reply to message:', message._id);
        // Implement reply logic here
        closeContextMenu();
    };
    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const instantActions = [
        { name: "Reply", action: (msg: Message) => handleReply(msg), icon: <Reply /> },
        { name: "Delete", action: (msg: Message) => handleDelete(msg), icon: <DeleteIcon /> }
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
        }
    }



    useEffect(() => {
        if (channelId) {
            getChatRoomData()
        }
    }, [channelId])


    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && message.trim()) {
            try {
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
                    })
                });
                const data = await response.json();
                setMessages((prev) => [...prev, { ...data.message, sender: currentUser }]); // Update local state with the new message
                setMessage(''); // Clear the input
            } catch (error) {
                console.error('Error sending message', error);
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

    const groupedMessages = groupMessagesByDate(messages)

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
    return (
        <div className="w-full h-screen flex flex-col bg-[#013a6fd3] text-white">
            {/* Header */}
            <div className="flex justify-between p-4 bg-[#013a6fae] border-b border-gray-700">
                <div className='flex items-center gap-2 font-bold text-xl'>
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
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="text-neutral-400 text-sm my-2 text-center flex items-center">
                                <hr className="flex-grow border-t border-neutral-600" />
                                <span className="mx-2">{date}</span> {/* Margin added for spacing */}
                                <hr className="flex-grow border-t border-neutral-600" />
                            </div>


                            {msgs.map((msg) => (
                                <div key={msg._id} onContextMenu={handleContextMenu} className={`flex items-center gap-4 hover:bg-[#cbcbcb2e] cursor-pointer p-2 rounded-md`}>
                                    <Avatar className='w-[40px] h-[40px] bg-neutral-200 rounded-full'>
                                        <AvatarImage src={msg.sender?.profile_pic} />
                                        <AvatarFallback />
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <div className="flex gap-2 items-center">
                                            <span>{msg?.sender?.lastName} {msg?.sender?.firstName}</span>
                                            <span className="text-[.7rem] text-neutral-400">{formatMessageDate(msg.createdAt)}</span>
                                        </div>
                                        <div className='text-[#d8d8d8]'>{msg.content}</div>
                                    </div>
                                    {/* Context Menu */}
                                    {contextMenu.visible && (
                                        <div
                                            className="absolute bg-gray-700 text-white rounded-md shadow-lg w-[200px]"
                                            style={{ left: contextMenu.x, top: contextMenu.y }}
                                            onMouseLeave={closeContextMenu} // Close on mouse leave
                                        >
                                            {
                                                instantActions.map((action, index) => (
                                                    <button className={`w-full text-left p-2 hover:bg-blue-600 ${action.name === "Delete" && "text-red-500 hover:text-white hover:bg-red-500"} flex items-center gap-2`} onClick={() => action.action(msg)}>

                                                        {action.icon}
                                                        {action.name}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                }
            </div>

            {/* Footer */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
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
                        className="flex-grow bg-gray-700 p-2 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Message ${channel?.name}`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <div className="flex items-center gap-2">
                        <Smile className="cursor-pointer hover:text-blue-400" />
                        <StickerIcon className="cursor-pointer hover:text-blue-400" />
                        <Sticker className="cursor-pointer hover:text-blue-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
