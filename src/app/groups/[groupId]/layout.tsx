'use client'
import React, { useContext, useEffect, useState } from 'react'
import Aside from './Aside'
import { useParams } from 'next/navigation'
import { useGetGroup } from '@/api/group'
import { GroupTypes } from '@/types'
import { GroupContext } from '@/context/GroupContext'
import MemberList from './MemberList'
import MainLoader from '@/components/MainLoader'
import Error from '@/components/Error'

type Props = {
    children: React.ReactNode
}

function GroupIdLayout({ children }: Props) {
    const { getGroup, isError, isSuccess, isLoading } = useGetGroup()
    const { groupId } = useParams()
    const { group, setGroup } = useContext(GroupContext)
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


    if (!group?._id) return <MainLoader />
    if (isLoading) return <MainLoader />
    if (isError) return <Error />
    return (
        <div className='flex w-full text-neutral-200'>
            <Aside />
            <div className='w-[80%] bg-[#013a6fae] flex'>
                <div className="w-[75%] overflow-auto">
                    {children}
                </div>
                <MemberList />
            </div>
        </div>
    )
}

export default GroupIdLayout