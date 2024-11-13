'use client'
import { ArrowLeft, DoorClosed, Menu } from 'lucide-react'
import React, { useContext } from 'react'
import { Input } from '../ui/input'
import { AdminContext } from '@/context/AdminContext'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import Link from 'next/link'
import { AiOutlineProfile } from 'react-icons/ai'
import { Button } from '../ui/button'
import Cookies from 'js-cookie'

type Props = {}

function Header({ }: Props) {
    const { isVisible, toggleSideBar, currentUser } = useContext(AdminContext)
    return (
        <div className='w-full p-2 bg-transparent backdrop:blur-lg  flex justify-between border-b-2'>
            <div className='w-auto flex items-center gap-3'>
                {
                    isVisible ? <ArrowLeft className='cursor-pointer' onClick={toggleSideBar} /> : <Menu className='cursor-pointer' onClick={toggleSideBar} size={30} />
                }
            </div>

            <div>
                <Popover>
                    <PopoverTrigger className='w-full'>
                        <div className='w-full flex items-start justify-normal p-2 gap-2 cursor-pointer hover:bg-slate-50 rounded-md transition duration-75'>
                            <Avatar className='size-11'>
                                <AvatarFallback></AvatarFallback>
                                <AvatarImage src={currentUser?.profile_pic} />
                            </Avatar>
                            <div className='flex flex-col gap-0 items-start justify-normal'>
                                <h1 className='text-neutral-500 font-bold text-md'>{currentUser?.lastName} {currentUser?.firstName}</h1>
                                <span className='text-sm text-slate-500'>{currentUser?.role}</span>
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='bg-white w-auto flex flex-col gap-1 items-start justify-normal p-0'>
                        <Link href={`/public_pages/Profile`} className='flex p-3 rounded-md items-center gap-2 hover:bg-neutral-100 w-full'>
                          <Button
                                className='flex items-center gap-2 hover:bg-slate-100'>
                                <AiOutlineProfile />
                                Profile
                          </Button>
                        </Link>
                        <Button
                            onClick={() => {
                                Cookies.remove('access-token')
                                Cookies.remove('admin')
                                window.location.href = '/manager_pages/signin'
                            }}
                            className='flex items-center gap-2 hover:bg-red-500 hover:text-slate-100 w-full'>
                            <DoorClosed />
                            Logout
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default Header