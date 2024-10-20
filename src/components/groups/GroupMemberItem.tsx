import { iconTextGenerator } from '@/lib/iconTextGenerator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React, { useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useMyContext } from '@/context/MyContext';
import StatusDot from '../ui/StatusDot';
import { User } from '@/types';

type Props = {
    profile_pic?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
    email?: string;
    role?: string;
    socketId?: string;
}

export const checkIsActive = (onlineUsers: User[] | null, member: Props) => {
    return onlineUsers?.find(user => user._id === member.userId)
}

function GroupMemberItem(member: Props) {
    const { onlineUsers } = useMyContext()

    useEffect(() => {
        console.log('onlineUsers', onlineUsers, "members", member)
    }, [member, onlineUsers])
    return (
        <div className='flex items-center justify-normal gap-5 p-3 w-full cursor-pointer hover:bg-[#6bb7ff73] duration-150 rounded-lg'>
            <Popover>
                <PopoverTrigger className='flex items-center justify-normal gap-5 relative'>
                    <Avatar>
                        <AvatarImage src={member.profile_pic} className="bg-black" />
                        <AvatarFallback>{iconTextGenerator(member?.firstName as string, member?.lastName as string)}</AvatarFallback>
                    </Avatar>
                    <StatusDot status={checkIsActive(onlineUsers, member) ? 'online' : "offline"} />
                </PopoverTrigger>
                <PopoverTrigger>
                    <h1>{member.firstName} {member.lastName}</h1>
                </PopoverTrigger>
                <PopoverContent className="bg-[#013a6f] text-white flex flex-col items-center gap-2 border-transparent shadow-lg rounded-lg">
                    <Avatar className='w-[100px] h-[100px]'>
                        <AvatarImage src={member.profile_pic} className="bg-black" />
                        <AvatarFallback>{iconTextGenerator(member?.firstName as string, member?.lastName as string)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-[1.4rem] font-bold">{member.firstName} {member.lastName}</h1>
                    <h1>{member.role === "GroupManager" ? "Admin" : member.role === "GroupModerator" ? "Moderator" : "Member"}</h1>
                    <h1>{member.email}</h1>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default GroupMemberItem