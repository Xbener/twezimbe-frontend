import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { User } from '@/types'
import { Search } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import GroupMemberItem from '@/components/groups/GroupMemberItem'

type Props = {
    isLoading: boolean;
    admins: User[];
    moderators: User[];
    members: User[];
}

function MemberList({ admins, moderators, members, isLoading }: Props) {

    const { group } = useContext(GroupContext)
    const [q, setQ] = useState('')

    return (
        <div className='w-[25%] bg-[#013a6fa6] overflow-auto'>
            {/* Search Bar */}
            <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                <input name="q" onChange={(e) => setQ(e.target.value)} className='bg-transparent outline-none w-full' placeholder='Search ...' />
                <Search />
            </div>

            <>
                {
                    q ? members?.map((member, index) => {
                        if (member.lastName.toLowerCase().includes(q.toLowerCase()) || member.firstName.toLowerCase().includes(q.toLowerCase())) {
                            return <GroupMemberItem key={index} {...member} />
                        } else {
                            return null
                        }
                    }) : isLoading ? (
                        <div className="w-full p-2 grid place-content-center">
                            loading ...
                        </div>

                    ) : (
                        <>
                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 capitalize'>Admins ({admins.length})</h1>
                                {
                                    admins.length === 0 ? "No admins" : admins.map((admin, index) => (
                                        <GroupMemberItem key={index} {...admin} />
                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 capitalize'>Moderators ({moderators.length})</h1>
                                {
                                    moderators.length === 0 ? "No moderators" : moderators.map((moderator, index) => (
                                        <GroupMemberItem key={index} {...moderator} />
                                    ))
                                }
                            </div>

                            <div className="w-full p-2 mb-3 ">
                                <h1 className='p-1 font-extrabold text-[0.9rem] mb-2 capitalize'>All Members ({members.length})</h1>
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
