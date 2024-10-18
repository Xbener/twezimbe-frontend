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

    const [admins, setAdmins] = useState<{ users: User[]; role: string }[]>([]);
    const [moderators, setModerators] = useState<{ users: User[]; role: string }[]>([]);
    const [members, setMembers] = useState<{ users: User[]; role: string }[]>([]);

    useEffect(() => {
        if (!group) return; // Prevents errors if group is null or undefined

        console.log('group', group);

        // Filter members based on their roles
        const filteredAdmins = group.members.filter(member => member.role === 'GroupManager');
        const filteredModerators = group.members.filter(member => member.role === 'GroupModerator');
        const filteredMembers = group.members.filter(member => member.role === 'GroupUser');

        setAdmins(filteredAdmins);
        setModerators(filteredModerators);
        setMembers(filteredMembers);
    }, [group]);

    return (
        <div className='w-[25%] bg-[#013a6fa6]'>
            <div className="flex items-center bg-[#013a6fae] p-2 justify-between text-neutral-200 w-full">
                <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                <Search />
            </div>

            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Admins</h1>
                {
                    admins.length === 0 ? "No admins" : admins.map((admin, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={admin.users[0]?.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(admin.users[0]?.firstName, admin.users[0]?.lastName)}</AvatarFallback>
                            </Avatar>
                            <h1>{admin.users[0]?.firstName} {admin.users[0]?.lastName}</h1>
                        </div>
                    ))
                }
            </div>

            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Moderators</h1>
                {
                    moderators.length === 0 ? "No moderators" : moderators.map((moderator, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={moderator.users[0]?.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(moderator.users[0]?.firstName, moderator.users[0]?.lastName)}</AvatarFallback>
                            </Avatar>
                            <h1>{moderator.users[0]?.firstName} {moderator.users[0]?.lastName}</h1>
                        </div>
                    ))
                }
            </div>

            <div className="w-full p-2 mb-3">
                <h1 className='p-1 font-bold text-[1.1rem] mb-2'>Members</h1>
                {
                    members.length === 0 ? "No other members" : members.map((member, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <Avatar>
                                <AvatarImage src={member.users[0]?.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(member.users[0]?.firstName, member.users[0]?.lastName)}</AvatarFallback>
                            </Avatar>
                            <h1>{member.users[0]?.firstName} {member.users[0]?.lastName}</h1>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default MemberList;
