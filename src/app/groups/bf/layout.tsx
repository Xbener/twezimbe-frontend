import React from 'react'

type Props = {
    children: React.ReactNode
}

function BFLayout({
    children
}: Props) {
    return (
        <div className="w-full h-full">
            {children}
        </div>
    )
}

export default BFLayout