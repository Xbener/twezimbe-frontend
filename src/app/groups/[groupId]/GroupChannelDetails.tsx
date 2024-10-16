import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GroupContext } from '@/context/GroupContext'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import React, { useContext } from 'react'

type Props = {

}



function ChannelDetails({ }: Props) {
    const { group } = useContext(GroupContext)

    const menuItems = [
        { name: "Group settings", link: `/groups/${group?._id}/settings`, icon: <Settings />, privilege: 'admin' },
    ]
    return (
        <>

            <Popover>
                <PopoverTrigger className="w-full">
                    <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                        {group?.group_name}
                        <CaretDownIcon className='w-[20px] ' />
                    </div>
                    <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                        {
                            menuItems.map((item, index) => (
                                <Link href={item.link} key={index} className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100">
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))
                        }
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
        </>
    )
}

export default ChannelDetails