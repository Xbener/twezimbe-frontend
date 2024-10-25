import { GroupContext } from '@/context/GroupContext'
import React, { useContext } from 'react'
import ChannelDetails from './GroupChannelDetails'

function Aside() {
    const { isSideBarOpen, isMemberListOpen, windowWidth } = useContext(GroupContext)

    return (
        <div
            className={`bg-[#013a6fd8] h-full text-neutral-200 capitalize transition-all duration-300
                ${isMemberListOpen && windowWidth! <= 1025
                    ? 'w-full absolute top-0 left-0 h-full bg-blue-500 z-50'
                    : 'relative hidden w-[15%] sm:w-[20%] md:w-[25%] lg:w-[20%] xl:w-[15%]'}
                md:block`}
        >
            <ChannelDetails />
        </div>
    )
}

export default Aside
