'use client'

import { useGetAllUsers, useGetProfileData } from '@/api/auth'
import { useGetAllGroups } from '@/api/group'
import { getAllQuestions, getFaqs } from '@/api/inquries'
import { fetchAllTransactions } from '@/api/transaction'
import { getAllBfs } from '@/lib/bf'
import { BF, FAQ, GroupTypes, SystemMessage, Transaction, User } from '@/types'
import React, { useEffect, useState } from 'react'

type Props = {
    children: React.ReactNode
}

export interface AdminContextTypes {
    isVisible?: boolean
    toggleSideBar: () => void
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
    setUsers: (vl: any) => void
    setGroups: (vl: any) => void
    setBfs: (vl: any) => void
    setTransactions: (vl: any) => void
    messages?: SystemMessage[]
    setMessages: (vl: any) => void
    faqs?: FAQ[]
    setFaqs: (vl: any) => void
    windowWidth?: number
}

export const AdminContext = React.createContext<AdminContextTypes>({
    setSelectedBf(vl) { },
    setSelectedGroup(vl) { },
    setSelectedUser(vl) { },
    setGroups(vl) { },
    setUsers(vl) { },
    setBfs(vl) { },
    setTransactions(vl) { },
    setFaqs(vl) { },
    setMessages(vl) { },
    toggleSideBar() { }
})

function AdminContextProvider({ children }: Props) {
    const [isVisible, setIsVisible] = useState(true)
    const { currentUser } = useGetProfileData()
    const { users: allUsers, isLoading } = useGetAllUsers()
    const { groups: allGroups } = useGetAllGroups()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<GroupTypes | null>(null)
    const [selectedBf, setSelectedBf] = useState<BF | null>(null)
    const [bfs, setBfs] = useState([])
    const [windowWidth, setWindowWidth] = useState<Window['innerWidth']>(0)
    const [groups, setGroups] = useState<GroupTypes[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [messages, setMessages] = useState<SystemMessage[]>([])
    useEffect(() => {

        const handleWindowChange = () => {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleWindowChange)

        return () => window.removeEventListener('resize', handleWindowChange)
    }, [])

    useEffect(() => {
        console.log(windowWidth)
    }, [windowWidth])


    useEffect(() => {
        const getData = async () => {
            const bfs = await getAllBfs()
            const transactions = await fetchAllTransactions()
            const messages = await getAllQuestions()
            const faqs = await getFaqs()
            setFaqs(faqs)
            setMessages(messages)
            setBfs(bfs)
            setTransactions(transactions)
        }
        getData()
    }, [])
    const toggleSideBar = () => {
        setIsVisible(!isVisible);
    }
    useEffect(() => {
        setGroups(allGroups)
    }, [allGroups])
    useEffect(() => {
        if (allUsers) {
            setUsers(allUsers)
        }
    }, [allUsers])
    return (
        <AdminContext.Provider value={{
            isVisible,
            toggleSideBar,
            currentUser,
            users,
            groups,
            bfs,
            isLoading,
            transactions,
            selectedBf,
            selectedGroup,
            selectedUser,
            setSelectedBf,
            setSelectedGroup,
            setSelectedUser,
            setGroups, setUsers,
            setTransactions,
            setBfs,
            setFaqs, setMessages,
            faqs,
            messages,
            windowWidth
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider