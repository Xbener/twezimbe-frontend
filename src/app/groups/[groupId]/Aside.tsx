import { GroupContext } from '@/context/GroupContext'
import { GroupTypes } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon } from 'lucide-react'
import React, { useContext } from 'react'
import ChannelDetails from './GroupChannelDetails'



function Aside({ }) {
    const { group, isSideBarOpen } = useContext(GroupContext)

    console.log("group", group)
    return (
        <div className={`w-[35%] md:w-[20%] bg-[#013a6fd8] h-full text-neutral-200 capitalize relative hidden sm:block`}>
            d
            <ChannelDetails />
        </div>
    )
}

export default Aside