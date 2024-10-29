'use client'

import { BF, GroupTypes, User } from '@/types'
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
    privateChannelMembers: User[]
    setPrivateChannelMembers: (vl: any) => any
    isSideBarOpen?: boolean
    isMemberListOpen?: boolean
    setIsSideBarOpen: (vl: boolean) => void | boolean
    setIsMemberListOpen: (vl: boolean) => void | boolean
    windowWidth?: number
    selectedGroup?: GroupTypes | null
    setSelectedGroup: (vl: any) => void
    groupBF?: BF | null
    setGroupBF: (vl: any) => void
}

export const GroupContext = React.createContext<GroupContextTypes>({
    group: null,
    setGroup: () => { },
    admins: [],
    moderators: [],
    members: [],
    isLoading: true,
    privateChannelMembers: [],
    setPrivateChannelMembers: () => { },
    setIsSideBarOpen(vl) { },
    setIsMemberListOpen(vl) { },
    setSelectedGroup(vl) { },
    setGroupBF(vl) { },
})

function GroupProvider({ children }: Props) {

    const [group, setGroup] = useState<GroupTypes | null>(null)
    const { admins, setAdmins, moderators, setModerators, members, setMembers, setCurrentChannel } = useMyContext()
    const [privateChannelMembers, setPrivateChannelMembers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [windowWidth, setWindowWidth] = useState<Window['innerWidth']>(0)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const [isMemberListOpen, setIsMemberListOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<GroupTypes | null>(null)
    const [groupBF, setGroupBF] = useState<BF | null>(null)

    useEffect(() => {
        const getGroupBF = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/${group?._id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('access-token')}`
                    }
                })

                const data = await res.json()
                if (!data.status) throw new Error(data.error || data.message || data.errors)
                setGroupBF(data.bf)
            } catch (error) {
                console.log('error getting group bearevement fund', error)
            }
        }

        if (group && group?._id && group?.has_bf) {
            getGroupBF()
        }
    }, [group])
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
            setPrivateChannelMembers([])
        }
    }, [group]);

    return (
        <GroupContext.Provider value={{
            group,
            setGroup,
            admins,
            moderators,
            members,
            isLoading,
            privateChannelMembers,
            setPrivateChannelMembers,
            isSideBarOpen,
            setIsSideBarOpen,
            windowWidth,
            isMemberListOpen,
            setIsMemberListOpen,
            selectedGroup,
            setSelectedGroup,
            groupBF,
            setGroupBF

        }}>

            {children}
        </GroupContext.Provider>
    )
}


export default GroupProvider