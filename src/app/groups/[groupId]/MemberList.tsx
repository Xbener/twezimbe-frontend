import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { GroupTypes, User } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { Search } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'

type Props = {}

function MemberList({ }: Props) {

    const { group } = useContext(GroupContext)

    const [admins, setAdmins] = useState<{ user: User; role: string }[]>([]);
    const [moderators, setModerators] = useState<{ user: User; role: string }[]>([]);
    const [members, setMembers] = useState<{ user: User; role: string }[]>([]);

    useEffect(() => {
        console.log('group fff', group);

        setAdmins((prev) => {
            return group?.members.filter(member => member?.role === 'GroupManager') || [];
        });

        setModerators((prev) => {
            return group?.members.filter(member => member?.role === 'GroupModerator') || [];
        });

        setMembers((prev) => {
            return group?.members.filter(member => member?.role === 'GroupUser') || [];
        });
    }, [group]);
    return (
        <div
            className='w-[25%] bg-[#013a6fa6]'
        >
            {/* <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                Members
                <CaretDownIcon className='w-[20px] ' />
            </div> */}

            <div className="flex items-center bg-[#013a6fae] p-2 justify-between text-neutral-200 w-full">
                <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                <Search />
            </div>
            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Admins</h1>
                {
                     admins?.map((member, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={member?.user.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(member?.user.firstName, member?.user.lastName)}</AvatarFallback>
                            </Avatar>

                            <h1>{member?.user.firstName} {member?.user.lastName}</h1>
                        </div>
                    ))
                }
            </div>
            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Moderators</h1>
                {
                   moderators?.length <=0 ? "No moderators" : moderators?.map((member, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={member?.user.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(member?.user.firstName, member?.user.lastName)}</AvatarFallback>
                            </Avatar>

                            <h1>{member?.user.firstName} {member?.user.lastName}</h1>
                        </div>
                    ))
                }
            </div>
            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Members</h1>
                {
                    members?.length <= 0 ? "No other members" : members?.map((member, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={member?.user.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(member?.user.firstName, member?.user.lastName)}</AvatarFallback>
                            </Avatar>

                            <h1>{member?.user.firstName} {member?.user.lastName}</h1>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default MemberList