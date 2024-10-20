import { useGetProfileData } from "@/api/auth";
import { ChannelTypes, FriendTypes, JoinedGroupTypes, Message, User } from "@/types";
import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

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

};


const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: Props) => {
    const [groupList, setGroupList] = useState<JoinedGroupTypes[] | undefined>([]);
    const [channelList, setChannelList] = useState<ChannelTypes[] | undefined>([]);
    const [groupNotificationFlag, setGroupNotificationFlag] = useState<boolean>(false)
    const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null)
    const [sendMsgGroupId, setSendMsgGroupId] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([

    ])
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
                setMessages(prev => ([...prev, vl.message]))
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
                setMessages
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