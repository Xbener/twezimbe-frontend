'use client'
import React, { useRef, useEffect } from 'react'
import Cookies from 'js-cookie'
type Props = {
    children: React.ReactNode
}

function BFLayout({
    children
}: Props) {

    const access_token = useRef(Cookies.get('access-token'))

    useEffect(() => {
        if (!access_token.current) {
            window.location.href = `/public_pages/SignIn`
        }
    }, [])


    return (
        <div className="w-full h-full overflow-auto">
            {children}
        </div>
    )
}

export default BFLayout