import React from 'react'

type Props = {
    children: React.ReactNode
}

function BFLayout({
    children
}: Props) {
    return (
        <div>
            {children}
        </div>
    )
}

export default BFLayout