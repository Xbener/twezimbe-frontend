'use client'
import MainLoader from '@/components/MainLoader'
import { GroupContext } from '@/context/GroupContext'
import { useParams } from 'next/navigation'
import React, { useContext } from 'react'

type Props = {}

function GroupId({ }: Props) {

    const { group } = useContext(GroupContext)
    return (
        <div className='w-[100%] flex items-center justify-center h-full'>
            <MainLoader />
        </div>
    )
}

export default GroupId