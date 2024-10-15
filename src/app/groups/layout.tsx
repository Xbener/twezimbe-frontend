import GroupNav from "@/components/groups/group-nav";
import React from "react";
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

export default function GroupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${geologica.className} flex fixed top-0 h-[100dvh] w-full`}>
            <GroupNav />
            {children}
        </div>
    )
}
