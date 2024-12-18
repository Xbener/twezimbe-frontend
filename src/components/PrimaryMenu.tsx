import { useGetProfileData } from "@/api/auth";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { iconTextGenerator } from "@/lib/iconTextGenerator";
import { User } from "@/types";
import Cookies from "js-cookie";
import { DoorOpen, File, LucideCircleUser } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const PrimaryMenu = ({ currentUser }: { currentUser: User }) => {
    const [userInfo, setUserInfo] = useState<User>();

    useEffect(() => {
        if (currentUser) {
            setUserInfo(currentUser)
        }
    }, [currentUser])

    return (
        <>
            {/* Desktop menu  */}
            <div className="hidden lg:block text-[1rem] md:text-[0.8rem]">
                <span className="flex gap-5">
                    <a href={'/'} className="text-[#2f578b]">Home</a>
                    <a href={'/'} className="text-[#2f578b]">About Us</a>
                    <a href={'/'} className="text-[#2f578b]">Features</a>
                    <a href={'/'} className="text-[#2f578b]">Book Demo</a>
                    <a href={'/public_pages/faqs'} className="text-[#2f578b]">FAQs</a>
                    <a href={'/groups'} className="text-[#2f578b]">Group</a>
                    <a href={'/groups/bf'} className="text-[#2f578b]">Bereavement Fund</a>
                    {
                        currentUser?.role === 'Admin' && <a href="/manager_pages" className="text-[#2f578b]">Admin</a>
                    }
                </span>
            </div>

            <div className="hidden md:block">
                {userInfo?._id
                    ?
                    <Popover>
                        <PopoverTrigger className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={userInfo.profile_pic} className="bg-black" />
                                <AvatarFallback>{iconTextGenerator(userInfo.firstName, userInfo.lastName)}</AvatarFallback>
                            </Avatar>
                            <p className="text-[#2f578b]">{userInfo.firstName}</p>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col w-auto gap-2 bg-[#2f578b]">
                            <Link href={'/public_pages/Profile'} className="flex items-center justify-between px-3 gap-3 py-1 rounded-sm text-white hover:bg-blue-700">
                                <span>Profile</span>
                                <LucideCircleUser />
                            </Link>
                            <Link href={'/account/applications'} className="flex items-center justify-between gap-3 px-3 py-1 rounded-sm text-white hover:bg-blue-700">
                                <span>Applications</span>
                                <File />
                            </Link>
                            <Button variant={'secondary'} className="text-white flex items-center justify-between gap-3 hover:bg-red-700" size={'sm'} onClick={() => {
                                Cookies.remove('access-token');
                                window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public_pages/SignIn`
                                // setUser(false);
                            }}>Sign out
                                <DoorOpen />
                            </Button>
                        </PopoverContent>
                    </Popover>
                    :
                    <Link href={'/public_pages/SignIn'} className="hidden md:block text-blue-950 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 font-bold">Sign In</Link>
                }
            </div>
        </>
    )
}

export default PrimaryMenu