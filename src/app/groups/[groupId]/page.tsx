'use client'
import { GroupContext } from '@/context/GroupContext'
import { useParams } from 'next/navigation'
import React, { useContext } from 'react'

type Props = {}

function GroupId({ }: Props) {

    const { group } = useContext(GroupContext)
    return (
        <div className='w-[75%] flex items-center justify-center h-full'>
            <h1 className='text-[3rem]'>
                Welcome to {group?.name} Group!
            </h1>
        </div>
    )
}

export default GroupId