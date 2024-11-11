'use client'

import { useGetAllUsers, useGetProfileData } from '@/api/auth'
import { useGetAllGroups } from '@/api/group'
import { getAllBfs } from '@/lib/bf'
import { BF, GroupTypes, User } from '@/types'
import React, { useEffect, useState } from 'react'

type Props = {
    children: React.ReactNode
}

export interface AdminContextTypes {
    isVisible?: boolean
    toggleSideBar?: () => void
    currentUser?: User
    bfs?: BF[]
    groups?: GroupTypes[]
    users?: User[]
    isLoading?: boolean
}

export const AdminContext = React.createContext<AdminContextTypes>({})

function AdminContextProvider({ children }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const { currentUser } = useGetProfileData()
    const { users: allUsers, isLoading } = useGetAllUsers()
    const { groups } = useGetAllGroups()
    const [bfs, setBfs] = useState([])
    useEffect(() => {
        const getData = async () => {
            const bfs = await getAllBfs()
            setBfs(bfs)
        }
        getData()
    }, [])
    const toggleSideBar = () => {
        setIsVisible(!isVisible);
    }

    return (
        <AdminContext.Provider value={{
            isVisible,
            toggleSideBar,
            currentUser,
            users: allUsers,
            groups,
            bfs,
            isLoading
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider