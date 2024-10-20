import { useGetProfileData } from "@/api/auth";
import { FriendTypes, JoinedGroupTypes, User } from "@/types";
import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

type Props = {
    children: React.ReactNode;
}

type MyContextType = {
    groupList: JoinedGroupTypes[] | undefined
    setGroupList: (value: JoinedGroupTypes[] | undefined) => void
    groupNotificationFlag: boolean;
    setGroupNotificationFlag: (value: boolean) => void;
    sendMsgGroupId: string;
    setSendMsgGroupId: (value: string) => void;
    onlineUsers: User[] | null;
    setOnlineUsers: (vl: User[]) => void;

};


const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: Props) => {
    const [groupList, setGroupList] = useState<JoinedGroupTypes[] | undefined>([]);
    const [groupNotificationFlag, setGroupNotificationFlag] = useState<boolean>(false)
    const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null)
    const [sendMsgGroupId, setSendMsgGroupId] = useState<string>('')
    const { currentUser } = useGetProfileData()

    useEffect(() => {
        if (currentUser?._id) {
            socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`)
            socket.emit('add-online-user', currentUser)
            socket.on('user-logged-in', ({ user, onlineUsers }) => {
                setOnlineUsers(onlineUsers); 
            });

            socket.on('user-logged-out', ({ user, onlineUsers }) => {
                setOnlineUsers(onlineUsers);
            });
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
                groupList,
                groupNotificationFlag,
                setGroupNotificationFlag,
                sendMsgGroupId,
                setSendMsgGroupId,
                onlineUsers,
                setOnlineUsers
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