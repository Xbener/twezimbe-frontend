'use client'
import GroupNav from "@/components/groups/group-nav";
import React, { useEffect, useState } from "react";
import { Geologica } from 'next/font/google'
import { useGetProfileData } from "@/api/auth";
import { useGetjoinedGroupList } from "@/api/group";
import { useMyContext } from "@/context/MyContext";
import { User } from "@/types";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie'
import GroupProvider from "@/context/GroupContext";

const geologica = Geologica({ subsets: ['latin'] })

export default function GroupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { setGroupList } = useMyContext()
    const router = useRouter()
    const access_token = Cookies.get('access-token')
    const { joinedGroupList } = useGetjoinedGroupList();
    const { userEnter } = useMyContext()
    const { currentUser } = useGetProfileData();
    const [userInfo, setUserInfo] = useState<User>();
    const params = useParams()

    useEffect(() => {
        if (currentUser) {
            setUserInfo(currentUser)
        }
    }, [currentUser])

    useEffect(() => {
        setGroupList(joinedGroupList)
    }, [joinedGroupList])
    return (
        <div className={`${geologica.className} flex fixed top-0 h-[100dvh] w-full`}>
            <GroupProvider>
                <GroupNav />
                {children}
            </GroupProvider>
        </div>
    )
}
