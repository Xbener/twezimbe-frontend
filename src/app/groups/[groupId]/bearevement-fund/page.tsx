'use client'
import { GroupContext } from '@/context/GroupContext'
import React, { useContext, useEffect } from 'react'

type Props = {}

function page({ }: Props) {

    const { group, groupBF, setPrivateChannelMembers } = useContext(GroupContext)
    useEffect(() => {
        setPrivateChannelMembers([])
    }, [])
    return (
        <div>
            {groupBF?.fundName}
        </div>
    )
}

export default page