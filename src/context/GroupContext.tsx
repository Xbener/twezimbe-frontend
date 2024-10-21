'use client'

import { GroupTypes, User } from '@/types'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useMyContext } from './MyContext'

type Props = {
    children: React.ReactNode
}

type GroupContextTypes = {
    group: GroupTypes | null,
    setGroup: (vl: GroupTypes | null) => void;
    admins: User[];
    moderators: User[];
    members: User[];
    isLoading: boolean
}

export const GroupContext = React.createContext<GroupContextTypes>({
    group: null,
    setGroup: () => { },
    admins: [],
    moderators: [],
    members: [],
    isLoading: true
})

function GroupProvider({ children }: Props) {

    const [group, setGroup] = useState<GroupTypes | null>(null)
    const { admins, setAdmins, moderators, setModerators, members, setMembers } = useMyContext()
    const [isLoading, setIsLoading] = useState(false)


    const handleGetMembers = async () => {
        const token = Cookies.get('access-token')
        try {
            setIsLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/members/${group?._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()

            console.log('members', data)
            // Assuming the API returns the correct structure
            setAdmins(data.members.filter((member: any) => member.role === "GroupManager"));
            setModerators(data.members.filter((member: any) => member.role === "GroupModerator"));
            setMembers(data.members.filter((member: any) => member.role === "GroupUser"));

        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (group) {
            handleGetMembers()
        }
    }, [group]);

    return (
        <GroupContext.Provider value={{ group, setGroup, admins, moderators, members, isLoading }}>
            {children}
        </GroupContext.Provider>
    )
}


export default GroupProvider