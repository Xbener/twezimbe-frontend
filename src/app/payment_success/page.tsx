'use client'

import { Check } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {}

function page({ }: Props) {
    const [timer, setTimer] = useState(5)
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!searchParams.get('success')) {
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups`
        }
    }, [])
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer(prev => prev !== 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        if (timer === 0) {
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${searchParams.get('groupId')}`
        }
    }, [timer])
    return (
        <div className="w-full h-full fixed grid place-content-center text-center text-[2rem] place-items-center">
            <Check color='green' className='size-[200px]' />
            <h1>Your Payment has been confirmed !</h1>
            <p>Redirecting in {timer} seconds</p>
        </div>
    )
}

export default page