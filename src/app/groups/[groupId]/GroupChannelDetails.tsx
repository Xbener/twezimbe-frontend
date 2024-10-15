import { GroupContext } from '@/context/GroupContext'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon } from 'lucide-react'
import React, { useContext } from 'react'

type Props = {

}

function ChannelDetails({ }: Props) {
    const { group } = useContext(GroupContext)
    return (
        <>
            <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                {group?.name}
                <CaretDownIcon className='w-[20px] ' />
            </div>

            {/* channels */}

            <div className='w-full p-2 flex flex-col mt-5'>
                <span className='flex items-center justify-between uppercase font-extrabold text-[0.9rem]'>
                    Channels
                    <span className='cursor-pointer'>
                        <PlusIcon />
                    </span>
                </span>
            </div>
        </>
    )
}

export default ChannelDetails