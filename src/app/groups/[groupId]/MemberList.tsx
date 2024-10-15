import { GroupContext } from '@/context/GroupContext'
import { CaretDownIcon } from '@radix-ui/react-icons'
import React, { useContext } from 'react'

type Props = {}

function MemberList({ }: Props) {

    const { group } = useContext(GroupContext)
    return (
        <div
            className='w-[25%] bg-[#013a6fa6]'
        >
            <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                Members
                <CaretDownIcon className='w-[20px] ' />
            </div>


            <div>
                {
                    group?.members?.map((member, index) => (
                        <div key={index} className='flex items-center justify-normal gap-5 p-3'>
                            <div className='w-[30px] h-[30px] bg-neutral-400 rounded-full cursor-pointer'></div>

                            <h1>{member.firstName} {member.lastName}</h1>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default MemberList