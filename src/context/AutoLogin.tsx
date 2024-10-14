'use client'

import { useSignIn } from '@/api/auth'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import Cookies from 'js-cookie'

type Props = {
    children: React.ReactNode,
}


export const AutoLoginContext = React.createContext(null)

function AutoLogin({ children }: Props) {

    const { signIn } = useSignIn()
    const searchParams = useSearchParams()
    useEffect(() => {
        if (searchParams.get('token') !== null && searchParams.get('user') !== null) {
            Cookies.set('access-token', searchParams.get('token'))
            window.location.replace('/')
        }
    }, [])
    return (
        <AutoLoginContext.Provider value={null}>
            {children}
        </AutoLoginContext.Provider>
    )
}

export default AutoLogin