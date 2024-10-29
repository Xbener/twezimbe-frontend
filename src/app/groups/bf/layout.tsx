import React from 'react'

type Props = {
    children: React.ReactNode
}

function BFLayout({
    children
}: Props) {
    return (
        <div className="w-full h-full overflow-auto">
            {children}
        </div>
    )
}

export default BFLayout