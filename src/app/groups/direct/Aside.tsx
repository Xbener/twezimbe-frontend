import { GroupContext } from '@/context/GroupContext'
import { GroupTypes } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon, Search } from 'lucide-react'
import React, { useContext, useState } from 'react'



function Aside({ }) {
    const { group } = useContext(GroupContext)  
    const [q,setQ] = useState('')

    console.log("group", group)
    return (
        <div className='w-[17%] bg-[#013a6fd8] h-full text-neutral-200 capitalize relative'>
            <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                <input name="q" onChange={(e) => setQ(e.target.value)} className='bg-transparent outline-none w-full' placeholder='Find a conversation ...' />
                <Search />
            </div>
        </div>
    )
}

export default Aside