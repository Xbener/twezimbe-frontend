import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { User } from '@/types'
import { Search } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

type Props = {}

function MemberList({ }: Props) {

    const { group } = useContext(GroupContext)
    const [isLoading, setIsLoading] = useState(false)
    const [admins, setAdmins] = useState<User[]>([]);
    const [moderators, setModerators] = useState<User[]>([]);
    const [members, setMembers] = useState<User[]>([]);

    const handleGetMembers = async () => {
        const token = Cookies.get('access-token')
        try {
            setIsLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/members/${group?._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            
            console.log('members', data)
            // Assuming the API returns the correct structure
            setAdmins(data.members.filter((member: any) => member.role === "GroupManager"));
            setModerators(data.members.filter((member: any) => member.role === "GroupModerator"));
            setMembers(data.members.filter((member: any) => member.role === "GroupUser"));

        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (group) {
            handleGetMembers()
        }
    }, [group]);

    return (
        <div className='w-[25%] bg-[#013a6fa6]'>

            {/* Search Bar */}
            <div className="flex items-center bg-[#013a6fae] p-2 justify-between text-neutral-200 w-full">
                <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                <Search />
            </div>

          <>
          {
            isLoading ? ("loading ... ") :(
                <>
                            <div className="w-full p-2 mb-3">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>Admins</h1>
                                {
                                    admins.length === 0 ? "No admins" : admins.map((admin, index) => (
                                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                                            <Avatar>
                                                <AvatarImage src={admin.profile_pic} className="bg-black" />
                                                <AvatarFallback>{iconTextGenerator(admin.firstName, admin.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <h1>{admin.firstName} {admin.lastName}</h1>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>Moderators</h1>
                                {
                                    moderators.length === 0 ? "No moderators" : moderators.map((moderator, index) => (
                                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                                            <Avatar>
                                                <AvatarImage src={moderator.profile_pic} className="bg-black" />
                                                <AvatarFallback>{iconTextGenerator(moderator.firstName, moderator.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <h1>{moderator.firstName} {moderator.lastName}</h1>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>All Members</h1>
                                {
                                    members.length === 0 ? "No other members" : members.map((member, index) => (
                                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                                            <Avatar>
                                                <AvatarImage src={member.profile_pic} className="bg-black" />
                                                <AvatarFallback>{iconTextGenerator(member.firstName, member.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <h1>{member.firstName} {member.lastName}</h1>
                                        </div>
                                    ))
                                }
                            </div>
                </>
            )
          }
          </>

        </div>
    )
}

export default MemberList;
