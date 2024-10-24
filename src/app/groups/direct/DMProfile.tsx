import { useGetProfileData } from '@/api/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DMContext } from '@/context/DMContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { ChevronRight } from 'lucide-react'
import moment from 'moment'
import React, { useContext } from 'react'

type Props = {}

function DMProfile({ }: Props) {
    const { currentUser } = useContext(DMContext)
    return (
        <div className="w-[25%] hidden lg:block bg-[#013a6fa6] overflow-auto p-2">
            <div className="flex flex-col p-3 items-center text-center gap-4">
                <Avatar className="w-[100px] h-[100px]">
                    <AvatarImage src={currentUser?.profile_pic} className="bg-black rounded-full" />
                    <AvatarFallback>{iconTextGenerator(currentUser?.firstName as string, currentUser?.lastName as string)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col '>
                    <h1 className="text-[1.2rem] font-bold">{currentUser?.lastName} {currentUser?.firstName}</h1>
                    <p>{currentUser?.email}</p>
                </div>

                <div className='bg-[#013a6fa6] w-full p-3 rounded-md'>
                    <h1>Joined {moment(currentUser?.createdAt as Date).format('MMM D, YYYY')}</h1>
                </div>
                <div className='w-full'>
                    <Button className="bg-blue-500 text-white w-full flex justify-between">
                        Edit profile
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DMProfile