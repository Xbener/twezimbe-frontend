'use client'

import { GroupTypes } from '@/types'
import React, { useState } from 'react'

type Props = {
    children: React.ReactNode
}

type GroupContextTypes = {
    group: GroupTypes | null,
    setGroup: (vl: GroupTypes | null) => void
}

export const GroupContext = React.createContext<GroupContextTypes>({
    group: null,
    setGroup: () => { }
})

function GroupProvider({ children }: Props) {

    const [group, setGroup] = useState<GroupTypes | null>(null)
    return (
        <GroupContext.Provider value={{ group, setGroup }}>
            {children}
        </GroupContext.Provider>
    )
}


export default GroupProvider