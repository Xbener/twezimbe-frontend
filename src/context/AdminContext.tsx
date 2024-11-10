'use client'

import React, { useState } from 'react'

type Props = {
    children: React.ReactNode
}

export interface AdminContextTypes {
    isVisible?: boolean
    toggleSideBar?: () => void
}

export const AdminContext = React.createContext<AdminContextTypes>({})

function AdminContextProvider({ children }: Props) {
    const [isVisible, setIsVisible] = useState(false)

    const toggleSideBar = () => {
        setIsVisible(!isVisible);
    }

    return (
        <AdminContext.Provider value={{
            isVisible,
            toggleSideBar
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider