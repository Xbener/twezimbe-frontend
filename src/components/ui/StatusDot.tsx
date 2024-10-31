import React from 'react'

type Props = {
    status: "online" | "offline" | 'idle' | 'do not disturb'
    display?: 'block' | 'absolute'
}

const StatusDot = ({ status, display }: Props) => {
    const dotStyle = status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-gray-500' : status === 'idle' ? 'bg-yellow-700' : 'bg-red-700'; // Use Tailwind classes for colors

    return (
        <span className={`w-3 h-3 rounded-full ${display === 'block' ? 'block' : 'absolute bottom-1 right-0'} border ${dotStyle}`} />
    );
};


export default StatusDot