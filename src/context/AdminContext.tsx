'use client'

import { useGetAllUsers, useGetProfileData } from '@/api/auth'
import { useGetAllGroups } from '@/api/group'
import { fetchAllTransactions } from '@/api/transaction'
import { getAllBfs } from '@/lib/bf'
import { BF, GroupTypes, Transaction, User } from '@/types'
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
    transactions?: Transaction[]
    selectedUser?: User | null
    setSelectedUser: (vl: any) => void
    selectedGroup?: GroupTypes | null
    setSelectedGroup: (vl: any) => void
    selectedBf?: BF | null
    setSelectedBf: (vl: any) => void
}

export const AdminContext = React.createContext<AdminContextTypes>({
    setSelectedBf(vl) { },
    setSelectedGroup(vl) { },
    setSelectedUser(vl) { },
})

function AdminContextProvider({ children }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const { currentUser } = useGetProfileData()
    const { users: allUsers, isLoading } = useGetAllUsers()
    const { groups } = useGetAllGroups()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<GroupTypes | null>(null)
    const [selectedBf, setSelectedBf] = useState<BF | null>(null)
    const [bfs, setBfs] = useState([])
    useEffect(() => {
        const getData = async () => {
            const bfs = await getAllBfs()
            const transactions = await fetchAllTransactions()
            setBfs(bfs)
            setTransactions(transactions)
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
            isLoading,
            transactions,
            selectedBf,
            selectedGroup,
            selectedUser,
            setSelectedBf,
            setSelectedGroup,
            setSelectedUser
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider