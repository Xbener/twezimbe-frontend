import { GroupContext } from '@/context/GroupContext'
import { GroupTypes } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon, X } from 'lucide-react'
import React, { useContext } from 'react'
import ChannelDetails from './GroupChannelDetails'



function Aside({ }) {
    const { group, isSideBarOpen, isMemberListOpen, windowWidth, setIsMemberListOpen } = useContext(GroupContext)

    console.log("group", group)
    return (
        <div className={` bg-[#013a6fd8] h-full text-neutral-200 capitalize ${isMemberListOpen && windowWidth! <= 1025 ? 'w-full absolute top-0 left-0 h-full bg-blue-500 z-50' : 'relative hidden w-[35%] md:w-[20%]'} sm:block`}>
           
            <ChannelDetails />
        </div>
    )
}

export default Aside