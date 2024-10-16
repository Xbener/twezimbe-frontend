import { GroupContext } from '@/context/GroupContext'
import { GroupTypes } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon } from 'lucide-react'
import React, { useContext } from 'react'
import ChannelDetails from './GroupChannelDetails'



function Aside({ }) {
    const { group } = useContext(GroupContext)

    console.log("group", group)
    return (
        <div className='w-[20%] bg-[#013a6fd8] text-neutral-200 capitalize relative'>
            <ChannelDetails />
        </div>
    )
}

export default Aside