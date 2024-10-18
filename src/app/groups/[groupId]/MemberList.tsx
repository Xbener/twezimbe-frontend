import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { User } from '@/types'
import { Search } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import GroupMemberItem from '@/components/groups/GroupMemberItem'

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
        <div className='w-[25%] bg-[#013a6fa6] overflow-auto'>

            {/* Search Bar */}
            <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                <Search />
            </div>

            <>
                {
                    isLoading ? (
                        <div className="w-full p-2 grid place-content-center"> 
                            loading ...
                        </div>

                    ) : (
                        <>
                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>Admins ({admins.length})</h1>
                                {
                                    admins.length === 0 ? "No admins" : admins.map((admin, index) => (
                                        <GroupMemberItem key={index} {...admin} />
                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>Moderators ({moderators.length})</h1>
                                {
                                    moderators.length === 0 ? "No moderators" : moderators.map((moderator, index) => (
                                        <GroupMemberItem key={index} {...moderator} />

                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 uppercase'>All Members ({members.length})</h1>
                                {
                                    members.length === 0 ? "No other members" : members.map((member, index) => (
                                        <GroupMemberItem key={index} {...member} />
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
