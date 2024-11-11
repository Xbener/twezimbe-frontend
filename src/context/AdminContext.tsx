'use client'

import { useGetProfileData } from '@/api/auth'
import { User } from '@/types'
import React, { useState } from 'react'

type Props = {
    children: React.ReactNode
}

export interface AdminContextTypes {
    isVisible?: boolean
    toggleSideBar?: () => void
    currentUser?: User
}

export const AdminContext = React.createContext<AdminContextTypes>({})

function AdminContextProvider({ children }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const { currentUser } = useGetProfileData()

    const toggleSideBar = () => {
        setIsVisible(!isVisible);
    }

    return (
        <AdminContext.Provider value={{
            isVisible,
            toggleSideBar,
            currentUser
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider