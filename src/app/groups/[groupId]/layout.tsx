'use client'
import React, { useContext, useEffect } from 'react'
import Aside from './Aside'
import { useParams, useRouter } from 'next/navigation'
import { useGetGroup } from '@/api/group'
import { GroupContext } from '@/context/GroupContext'
import MemberList from './MemberList'
import MainLoader from '@/components/MainLoader'
import Error from '@/components/Error'
import { toast } from 'sonner'
import { useGetGroupChannels } from '@/api/channel'
import { useMyContext } from '@/context/MyContext'
import { useGetProfileData } from '@/api/auth'

type Props = {
    children: React.ReactNode
}

function GroupIdLayout({ children }: Props) {
    const { getGroup, isError, isLoading: groupsLoading } = useGetGroup()
    const { getChannels, isLoading: channelsLoading } = useGetGroupChannels()
    const { groupId } = useParams()
    const { group, setGroup, admins, moderators, members, isLoading } = useContext(GroupContext)
    const { setChannelList, setCurrentChannel, channelList } = useMyContext()
    const { currentUser } = useGetProfileData()
    const router = useRouter()

    useEffect(() => {
        const fetchGroup = async () => {
            const res = await getGroup(groupId as string)
            if (res.group !== null) {
                setGroup(res.group)
            }
        }

        fetchGroup()
    }, [groupId])

    useEffect(() => {
        const getChannelsList = async (userId: string) => {
            const res = await getChannels({ userId, groupId: groupId as string })
            if (!res.status) toast.error(res.errors || res.message)
            setChannelList(res.channels)
        }

        if (group && currentUser) getChannelsList(currentUser?._id as string)
    }, [group])

    useEffect(() => {
        if (channelList) {
            setCurrentChannel(channelList[0])
            if (channelList[0]?._id) {
                router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${groupId}/room/${channelList[0]?._id}`)
            }
        }
    }, [channelList])

    if (!group?._id) return <MainLoader />
    if (groupsLoading) return <MainLoader />
    if (isError) return <Error />

    return (
        <div className='flex w-full text-neutral-200'>
            <Aside />
            <div className='flex-grow bg-[#013a6fae] flex'>
                <div className="w-full sm:w-[75%] md:w-[70%] lg:w-[65%] xl:w-[85%] overflow-auto flex-grow relative">
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
