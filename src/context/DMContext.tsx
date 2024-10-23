'use client'

import { useGetProfileData } from '@/api/auth'
import { ChatRoomTypes, User } from '@/types'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

type Props = {
    children: React.ReactNode
}

type DMContextTypes = {
    userDMs: ChatRoomTypes[]
    setUserDMs: (vl: ChatRoomTypes[]) => void
    currentUser?: User
    allUsers?: User[]
    currentDM: ChatRoomTypes | null
    setCurrentDM: (vl: ChatRoomTypes) => void
}

export const DMContext = React.createContext<DMContextTypes>({
    userDMs: [],
    setUserDMs: (vl) => { },
    // currentUser: {},
    currentDM: null,
    setCurrentDM: (vl)=>{}
})

function DMContextProvider({ children }: Props) {
    const [userDMs, setUserDMs] = useState<ChatRoomTypes[]>([])
    const { currentUser } = useGetProfileData()
    const [allUsers, setAllUsers] = useState([])
    const [currentDM, setCurrentDM] = useState<ChatRoomTypes | null>(null)

    useEffect(() => {
        const getAllUsers = async () => {
            try {
                const token = Cookies.get('access-token')
                const headers = {
                    'Authorization': `Bearer ${token}`
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/users`, {
                    headers
                })
                const data = await res.json()
                if (!data.status) return
                setAllUsers(data.users)
            } catch (error) {
                console.log(error)
            }
        }
        if (currentUser) {
            getAllUsers()
        }
    }, [currentUser])
    useEffect(() => {
        const getUserChatRooms = async () => {
            try {
                const token = Cookies.get('access-token')
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId: currentUser?._id, type: "dm" })
                })
                const data = await res.json()
                if (!data.status) return toast.error(data.errors || "something went wrong")
                setUserDMs(data.chatrooms)
            } catch (error) {
                toast.error('something went wrong')
                console.log(error)
            }
        }
        if (currentUser) {
            getUserChatRooms()
        }
    }, [currentUser])
    return (
        <DMContext.Provider value={{
            userDMs,
            setUserDMs,
            currentUser: currentUser!,
            allUsers,
            currentDM,
            setCurrentDM
        }}>
            {children}
        </DMContext.Provider>
    )
}

export default DMContextProvider