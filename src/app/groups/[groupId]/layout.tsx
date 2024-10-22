'use client'
import React, { useContext, useEffect, useState } from 'react'
import Aside from './Aside'
import { useParams } from 'next/navigation'
import { useGetGroup } from '@/api/group'
import { GroupTypes, User } from '@/types'
import { GroupContext } from '@/context/GroupContext'
import MemberList from './MemberList'
import MainLoader from '@/components/MainLoader'
import Error from '@/components/Error'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useGetGroupChannels } from '@/api/channel'
import { useMyContext } from '@/context/MyContext'
import { useGetProfileData } from '@/api/auth'

type Props = {
    children: React.ReactNode
}

function GroupIdLayout({ children }: Props) {
    const { getGroup, isError, isSuccess, isLoading: groupsLoading } = useGetGroup()
    const { getChannels, isError: channelsError, isLoading: channelsLoading, isSuccess: channelsSuccess } = useGetGroupChannels()
    const { groupId } = useParams()
    const { group, setGroup, admins, moderators, members, isLoading } = useContext(GroupContext)
    const { setChannelList } = useMyContext()
    const { currentUser } = useGetProfileData()


    useEffect(() => {
        const fetchGroup = async () => {
            const res = await getGroup(groupId as string)
            if (res._id !== null) {
                console.log('res', res)
                setGroup(res)
            }
        }

        fetchGroup()
    }, [groupId])

    useEffect(() => {
        const getChannelsList = async (userId: string) => {
            const res = await getChannels({userId, groupId: groupId as string})
            if (!res.status) toast.error(res.errors || res.message)
            console.log("res", res)
            setChannelList(res.channels)
        }

        if (group && currentUser) getChannelsList(currentUser?._id as string)
    }, [group])

    if (!group?._id) return <MainLoader />
    if (groupsLoading) return <MainLoader />
    if (isError) return <Error />
    return (
        <div className='flex w-full text-neutral-200'>
            <Aside />
            <div className='w-[83%] bg-[#013a6fae] flex'>
                <div className="w-[80%] overflow-auto">
                    {children}
                </div>
                <MemberList
                    isLoading={isLoading}
                    admins={admins}
                    moderators={moderators}
                    members={members}
                />
            </div>
        </div>
    )
}

export default GroupIdLayout