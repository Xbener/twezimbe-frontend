import React from 'react'

type Props = {
    status: "online" | "offline"
}

const StatusDot = ({ status }: Props) => {
    const dotStyle = status === 'online' ? 'bg-green-500' : 'bg-gray-500'; // Use Tailwind classes for colors

    return (
        <span className={`w-3 h-3 rounded-full absolute bottom-1 right-0 border ${dotStyle}`} />
    );
};


export default StatusDot