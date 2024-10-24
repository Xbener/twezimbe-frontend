'use client'
import React, { useContext, useEffect, useState } from 'react'
import Aside from './Aside'
import { useParams } from 'next/navigation'
import { useGetGroup } from '@/api/group'
import { GroupTypes, User } from '@/types'
import { GroupContext } from '@/context/GroupContext'
import MainLoader from '@/components/MainLoader'
import Error from '@/components/Error'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useGetGroupChannels } from '@/api/channel'
import { useMyContext } from '@/context/MyContext'
import { useGetProfileData } from '@/api/auth'
import DMProfile from './DMProfile'
import DMContextProvider from '@/context/DMContext'

type Props = {
    children: React.ReactNode
}

function DMLayout({ children }: Props) {

    return (
        <DMContextProvider>
            <div className='flex w-full text-neutral-200'>
                <Aside />
                <div className='md:w-[75%] sm:w-[65%] bg-[#013a6fae] flex flex-grow'>
                    <div className="w-[75%] flex-grow overflow-auto">
                        {children}
                    </div>
                    <DMProfile />
                </div>
            </div>
        </DMContextProvider>
    )
}

export default DMLayout