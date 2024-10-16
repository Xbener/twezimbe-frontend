import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { Search } from 'lucide-react'
import React, { useContext } from 'react'

type Props = {}

function MemberList({ }: Props) {

    const { group } = useContext(GroupContext)
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
            <div>
                {
                    group?.members?.map((member, index) => (
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
        </div>
    )
}

export default MemberList