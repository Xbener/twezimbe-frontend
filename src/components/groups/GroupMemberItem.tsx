import { iconTextGenerator } from '@/lib/iconTextGenerator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type Props = {
    profile_pic?: string;
    firstName?: string;
    lastName?: string;
    _id?: string;
    email?: string;
}

function GroupMemberItem(member: Props) {
    return (
        <div className='flex items-center justify-normal gap-5 p-3 w-full cursor-pointer hover:bg-[#6bb7ff73] duration-150 rounded-lg'>
            <Popover>
                <PopoverTrigger className='flex items-center justify-normal gap-5'>
                    <Avatar>
                        <AvatarImage src={member.profile_pic} className="bg-black" />
                        <AvatarFallback>{iconTextGenerator(member?.firstName as string, member?.lastName as string)}</AvatarFallback>
                    </Avatar>
                    <h1>{member.firstName} {member.lastName}</h1>
                </PopoverTrigger>
                <PopoverContent className="bg-[#013a6f] text-white flex flex-col items-center gap-2 border-transparent shadow-lg rounded-lg">
                    <Avatar className='w-[100px] h-[100px]'>
                        <AvatarImage src={member.profile_pic} className="bg-black" />
                        <AvatarFallback>{iconTextGenerator(member?.firstName as string, member?.lastName as string)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-[1.4rem] font-bold">{member.firstName} {member.lastName}</h1>
                    <h1>{member.email}</h1>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default GroupMemberItem