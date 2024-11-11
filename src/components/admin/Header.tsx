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
                <Avatar>
                    <AvatarFallback></AvatarFallback>
                    <AvatarImage />
                </Avatar>
            </div>
        </div>
    )
}

export default Header