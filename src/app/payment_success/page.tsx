import { Check } from 'lucide-react'
import React from 'react'

type Props = {}

function page({ }: Props) {
    return (
        <div className="w-full h-full fixed grid place-content-center text-center text-[2rem] place-items-center">
            <Check color='green' className='size-[200px]' />
            <h1>Your Payment has been confirmed !!</h1>
        </div>
    )
}

export default page