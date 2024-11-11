'use client'
import { ArrowLeft, Menu } from 'lucide-react'
import React, { useContext } from 'react'
import { Input } from '../ui/input'
import { AdminContext } from '@/context/AdminContext'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type Props = {}

function Header({ }: Props) {
    const { isVisible, toggleSideBar, currentUser } = useContext(AdminContext)
    return (
        <div className='w-full p-2 bg-transparent backdrop:blur-lg  flex justify-between border-b-2'>
            <div className='w-auto flex items-center gap-3'>
                {
                    isVisible ? <ArrowLeft className='cursor-pointer' onClick={toggleSideBar} /> : <Menu className='cursor-pointer' onClick={toggleSideBar} size={30} />
                }
                <Input
                    placeholder='search ...'
                />
            </div>

            <div>
                <div className='flex items-start justify-normal p-2 gap-2 cursor-pointer hover:bg-slate-50 rounded-md transition duration-75'>
                    <Avatar className='size-11'>
                        <AvatarFallback></AvatarFallback>
                        <AvatarImage src={currentUser?.profile_pic} />
                    </Avatar>
                    <div className='flex flex-col gap-0'>
                        <h1 className='text-neutral-500 font-bold text-md'>{currentUser?.lastName} {currentUser?.firstName}</h1>
                        <span className='text-sm text-slate-500'>{currentUser?.role}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header