'use client'
import { useGetProfileData } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { Edit, LogOut, PlusIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { userInfo } from 'os'
import React, { useContext } from 'react'
import Cookies from 'js-cookie'

type Props = {

}



function ChannelDetails({ }: Props) {
    const { group } = useContext(GroupContext)
    const { currentUser } = useGetProfileData()

    const handleUpgrade = async () => {
        const groupId = group?._id
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId }),
        });
        const { id, url } = await res.json();
        window.location.href = `${url}`;
    };


    const menuItems = [
        { name: "Group settings", link: `/groups/${group?._id}/settings`, icon: <Settings />, privilege: 'admin' },
        { name: "Group Join requests", link: `/groups/${group?._id}/requests`, icon: <Settings />, privilege: 'admin' },
        { name: "Notification Settings", link: `/groups/${group?._id}/settings`, icon: <Settings />, privilege: 'user' },
        { name: "Upgrade Plan", link: `#`, onClick: () => handleUpgrade(), icon: <Settings />, privilege: 'admin' },
    ]

    const settingsItems = [
        { name: "Edit profile", link: "/public_pages/Profile", icon: <Edit /> },
        {
            name: "Logout", link: "#", icon: <LogOut />,
            action: () => {
                Cookies.remove('access-token');
                window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public_pages/SignIn`
            }
        },
    ]

    const filteredMenuItems = menuItems.filter(item => {
        return item.privilege !== 'admin' || (currentUser?._id === group?.created_by[0]?._id);
    });
    return (
        <>

            <Popover>
                <PopoverTrigger className="w-full">
                    <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                        {group?.group_name}
                        <CaretDownIcon className='w-[20px] ' />
                    </div>
                    <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                        {filteredMenuItems.map((item, index) => (
                            <Link
                                onClick={(e) => {
                                    if (item.onClick) {
                                        e.preventDefault()
                                        item.onClick()
                                    }
                                }}
                                href={item.link}
                                key={index}
                                className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100"
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        ))}
                    </PopoverContent>
                </PopoverTrigger>
            </Popover>

            {/* channels */}

            <div className='w-full p-2 flex flex-col mt-5'>
                <span className='flex items-center justify-between uppercase font-extrabold text-[0.9rem]'>
                    Channels
                    <span className='cursor-pointer'>
                        <PlusIcon />
                    </span>
                </span>
            </div>

            <div className='absolute bottom-0 w-full bg-[#013a6f] h-auto p-5 flex items-center justify-start gap-2  '>
                <Avatar>
                    <AvatarImage src={currentUser?.profile_pic} className="bg-black w-[50px] h-[50px] rounded-full" />
                    <AvatarFallback>{iconTextGenerator(currentUser?.firstName as string, currentUser?.lastName as string)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                    <h1>{currentUser?.firstName} {currentUser?.lastName}</h1>
                    <Popover>
                        <PopoverTrigger>
                            <Button>
                                <Settings />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                            {
                                settingsItems.map((item, index) => (
                                    <Link href={item.link} key={index} className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100" onClick={item?.action}>
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))
                            }
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    )
}

export default ChannelDetails