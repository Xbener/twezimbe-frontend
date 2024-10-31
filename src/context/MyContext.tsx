import { useGetProfileData } from "@/api/auth";
import { ChannelTypes, ChatRoomTypes, FriendTypes, JoinedGroupTypes, Message, Reaction, UnreadMessage, User, UserSettings } from "@/types";
import Cookies from 'js-cookie';
import React, { createContext, Ref, useContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import addNotification from 'react-push-notification';
import { useParams } from "next/navigation";

export let socket: Socket;

type Props = {
    children: React.ReactNode;
};

type MyContextType = {
    groupList: JoinedGroupTypes[] | undefined;
    setGroupList: (value: JoinedGroupTypes[] | undefined) => void;
    channelList: ChannelTypes[] | undefined;
    setChannelList: (value: ChannelTypes[] | undefined) => void;
    groupNotificationFlag: boolean;
    setGroupNotificationFlag: (value: boolean) => void;
    sendMsgGroupId: string;
    setSendMsgGroupId: (value: string) => void;
    onlineUsers: User[] | null;
    setOnlineUsers: (vl: User[]) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    admins: User[];
    setAdmins: React.Dispatch<React.SetStateAction<User[]>>;
    moderators: User[];
    setModerators: React.Dispatch<React.SetStateAction<User[]>>;
    members: User[];
    setMembers: React.Dispatch<React.SetStateAction<User[]>>;
    currentChannel: ChannelTypes | null;
    setCurrentChannel: React.Dispatch<React.SetStateAction<ChannelTypes | null>>;
    isTyping: { message: string };
    setIsTyping: React.Dispatch<React.SetStateAction<{ message: string }>>;
    chId: string;
    setChId: React.Dispatch<React.SetStateAction<string>>;
    roomId: string;
    setRoomId: (vl: string) => void;
    userDMs: ChatRoomTypes[]
    setUserDMs: (vl: ChatRoomTypes[]) => void
    unreadMessages: UnreadMessage[]
    setUnreadMessages: (vl: any) => any
    roomIdRef: React.MutableRefObject<string>
    userSettings: UserSettings
    setUserSettings: (vl: UserSettings) => void
    unreadMessagesRef: React.MutableRefObject<UnreadMessage[]>
};

const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: Props) => {
    const [groupList, setGroupList] = useState<JoinedGroupTypes[] | undefined>([]);
    const { channelId } = useParams();
    const [chId, setChId] = useState(channelId as string);
    const [channelList, setChannelList] = useState<ChannelTypes[] | undefined>([]);
    const [groupNotificationFlag, setGroupNotificationFlag] = useState<boolean>(false);
    const [currentChannel, setCurrentChannel] = useState<ChannelTypes | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null);
    const [sendMsgGroupId, setSendMsgGroupId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [admins, setAdmins] = useState<User[]>([]);
    const [moderators, setModerators] = useState<User[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [isTyping, setIsTyping] = useState({ message: "" });
    const { currentUser } = useGetProfileData();
    const [userChatRooms, setUserChatRooms] = useState([])
    const [userDMs, setUserDMs] = useState<ChatRoomTypes[]>([])
    const [roomId, setRoomId] = useState('')
    const roomIdRef = useRef(roomId);
    const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([])
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
    const userSettingsRef = useRef(userSettings)
    const unreadMessagesRef = useRef<UnreadMessage[]>([])

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    useEffect(() => {
        unreadMessagesRef.current = unreadMessages
        console.log(unreadMessages, unreadMessagesRef.current)
    }, [unreadMessages])

    useEffect(() => {

        const getUserSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/user/${currentUser?._id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('access-token')}`
                    }
                })

                const data = await res.json()
                if (!data.status) return
                setUserSettings(data.userSettings)
            } catch (error) {
                console.log('failed to get user settings')
            }
        }
        if (currentUser) {

            getUserSettings()
        }
    }, [currentUser])

    useEffect(() => {
        const getUnreadMessages = async () => {
            try {
                const token = Cookies.get('access-token')
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages/unread`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: currentUser?._id })
                })
                const data = await res.json()
                if (!data.status) return console.log('error getting unread messages', data)
                setUnreadMessages(data.unreadMessages);
            }
            catch (error) {
                console.log(error)
            }
        }

        getUnreadMessages()
    }, [])

    useEffect(() => {
        if (document && unreadMessages && unreadMessagesRef.current?.filter(msg => !msg?.isRead!).length > 0) {
            document.title = `${unreadMessagesRef.current.filter(msg => !msg?.isRead!).length} unread messages `
        }
    }, [unreadMessagesRef.current])



    useEffect(() => {
        if (currentUser?._id) {
            const getUserChatRooms = async () => {
                try {
                    const token = Cookies.get('access-token')
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/chatrooms`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: currentUser?._id })
                    })
                    const data = await res.json()
                    if (!data.status) return console.log('error getting chatrooms', data)
                    setUserChatRooms(data.chatrooms);
                }
                catch (error) {
                    console.log(error)
                }
            }

            getUserChatRooms()
        }
    }, [currentUser, chId]);

    useEffect(() => {
        if (userChatRooms && currentUser?._id) {
            socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);
            socket.emit('add-online-user', { user: currentUser, userChatRooms });
            socket.emit('join-chat-rooms', userChatRooms)

            socket.on('user-logged-in', ({ user, onlineUsers }) => {
                setOnlineUsers(prev => ([...onlineUsers, { ...user, isActive: true }]));
            });

            socket.on('new-online-users', onlineUsers => {
                setOnlineUsers(onlineUsers)
            }) 

            socket.on('user-logged-out', ({ user, onlineUsers }) => {
                setOnlineUsers(onlineUsers);
            });

            socket.on('new-user-joined-group', ({ joined_user }) => {
                addNotification({
                    title: 'New group join',
                    subtitle: 'You have a new group member',
                    message: `${joined_user?.lastName} joined your community!`,
                    theme: 'darkblue',
                    native: true,
                });
                console.log("joined_user", joined_user);
                setMembers(prev => {
                    return [...prev.filter(member => member._id !== joined_user?._id), joined_user];
                });
            });
            const handleNewMessage = (vl: { message: Message, chatroomId: string, sentTo: string }) => {
                if (`${roomIdRef.current}` == `${vl.sentTo}` && roomIdRef.current === vl.chatroomId) {
                    setMessages((prev) => [...prev.filter(message => message._id !== vl.message._id), vl.message]);
                }
                if (!userSettings?.notificationSettings.chatroomsMuted.find(room => room === roomIdRef.current)) {
                    addNotification({
                        title: 'New Message',
                        subtitle: 'You have a new message',
                        message: vl.message.content,
                        theme: 'darkblue',
                        native: true,
                        onClick: () => window.focus()
                    });
                }
                setUnreadMessages(prev => {
                    return [...prev,
                    { messageId: vl.message._id || vl.sentTo, isRead: false, message: vl.message, userId: currentUser?._id }]
                })
                unreadMessagesRef.current = [...unreadMessagesRef.current, { messageId: vl.message._id || vl.sentTo, isRead: false, message: vl.message, userId: currentUser?._id }]
            };

            socket.on('new-message-added', handleNewMessage);
            socket.on('reacted-with-emoji', ({ msg, emoji, userId }) => {
                setMessages(prev => {
                    return prev.map(prevMsg => {
                        if (prevMsg._id === msg?._id) {
                            const existingReaction = prevMsg.reactions?.find(reaction => reaction.emoji === emoji && reaction.user_id === userId);

                            if (!existingReaction) {
                                return {
                                    ...prevMsg,
                                    reactions: [...prevMsg.reactions as any, { user_id: userId, emoji }]
                                };
                            }
                        }
                        return prevMsg;
                    });
                });
            });

            socket.on('removed-emoji', ({ msg, emoji, userId }) => {
                setMessages(prev => {
                    return prev.map((prevMsg: Message) => {
                        if (prevMsg._id === msg?._id) {
                            // Filter out the reaction from the reactions array where emoji and userId match
                            const updatedReactions = prevMsg.reactions?.filter(
                                reaction => !(reaction.emoji === emoji && reaction.user_id === userId)
                            );

                            // Return the updated message with filtered reactions
                            return {
                                ...prevMsg,
                                reactions: updatedReactions // Set the updated reactions array
                            };
                        }
                        return prevMsg;
                    });
                });
            });


            socket.on('is-typing', ({ message, currentUser }) => {
                setIsTyping({ message: `${currentUser?.firstName} is typing ...` });
            });

            socket.on('deleted-message', message => {
                console.log(message);
                setMessages(prev => prev.filter(msg => msg._id !== message._id));
            });

            return () => {
                if (socket) {
                    socket.disconnect();
                }
            };
        }
    }, [userChatRooms, currentUser])

    return (
        <MyContext.Provider
            value={{
                setGroupList,
                setChannelList,
                groupList,
                channelList,
                groupNotificationFlag,
                setGroupNotificationFlag,
                sendMsgGroupId,
                setSendMsgGroupId,
                onlineUsers,
                setOnlineUsers,
                messages,
                setMessages,
                admins,
                setAdmins,
                moderators,
                setModerators,
                members,
                setMembers,
                currentChannel,
                setCurrentChannel,
                isTyping,
                setIsTyping,
                chId,
                setChId,
                roomId,
                setRoomId,
                userDMs,
                setUserDMs,
                unreadMessages,
                setUnreadMessages,
                roomIdRef,
                userSettings: userSettings as UserSettings,
                setUserSettings,
                unreadMessagesRef
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export const useMyContext = () => {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
