import { useGetProfileData } from "@/api/auth";
import { ChannelTypes, FriendTypes, JoinedGroupTypes, Message, User } from "@/types";
import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import addNotification from 'react-push-notification'
import { useParams } from "next/navigation";

export let socket: Socket;

type Props = {
    children: React.ReactNode;
}

type MyContextType = {
    groupList: JoinedGroupTypes[] | undefined
    setGroupList: (value: JoinedGroupTypes[] | undefined) => void
    channelList: ChannelTypes[] | undefined
    setChannelList: (value: ChannelTypes[] | undefined) => void
    groupNotificationFlag: boolean;
    setGroupNotificationFlag: (value: boolean) => void;
    sendMsgGroupId: string;
    setSendMsgGroupId: (value: string) => void;
    onlineUsers: User[] | null;
    setOnlineUsers: (vl: User[]) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
    admins: User[]
    setAdmins: React.Dispatch<React.SetStateAction<User[]>>
    moderators: User[]
    setModerators: React.Dispatch<React.SetStateAction<User[]>>
    members: User[]
    setMembers: React.Dispatch<React.SetStateAction<User[]>>
    currentChannel: ChannelTypes | null
    setCurrentChannel: React.Dispatch<React.SetStateAction<ChannelTypes | null>>

};


const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: Props) => {
    const [groupList, setGroupList] = useState<JoinedGroupTypes[] | undefined>([]);
    const { channelId } = useParams()
    const [channelList, setChannelList] = useState<ChannelTypes[] | undefined>([]);
    const [groupNotificationFlag, setGroupNotificationFlag] = useState<boolean>(false)
    const [currentChannel, setCurrentChannel] = useState<ChannelTypes | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null)
    const [sendMsgGroupId, setSendMsgGroupId] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([

    ])
    const [admins, setAdmins] = useState<User[]>([]);
    const [moderators, setModerators] = useState<User[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const { currentUser } = useGetProfileData()

    useEffect(() => {
        if (currentUser?._id) {
            socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`)
            socket.emit('add-online-user', currentUser)
            socket.on('user-logged-in', ({ user, onlineUsers }) => {
                setOnlineUsers(prev => ([...onlineUsers, { ...user, isActive: true }]));
            });

            socket.on('user-logged-out', ({ user, onlineUsers }) => {
                setOnlineUsers(onlineUsers);
            });

            socket.on('new-message-added', vl => {
                console.log(vl)
                    setMessages(prev => {
                        return [...prev.filter(message => message._id !== vl.message._id), vl.message]
                    })
                addNotification({
                    title: 'New Message',
                    subtitle: 'You have a new message',
                    message: vl.message.content,
                    theme: 'darkblue',
                    native: true,
                    onClick: () => window.focus()

                })
            })

            socket.on('new-user-joined-group', ({ joined_user }) => {
                addNotification({
                    title: 'New group join',
                    subtitle: 'You have a new group member',
                    message: `${joined_user?.lastName} joined your community!`,
                    theme: 'darkblue',
                    native: true,
                })
                console.log("joined_user", joined_user)
                setMembers(prev => {
                    return [...prev.filter(member => member._id !== joined_user?._id), joined_user]
                })
            })
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [currentUser])

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
                setCurrentChannel
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