'use client';

import { useGetProfileData } from '@/api/auth';
import { Eye, Verified } from '@/components/groups/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import GroupCreateDialog from './GroupCreateDialog';
import { useMyContext } from '@/context/MyContext';
import { GroupContext } from '@/context/GroupContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PopoverTrigger, Popover, PopoverContent } from '../ui/popover';
import { iconTextGenerator } from '@/lib/iconTextGenerator';
import { Edit, Home, LogOut } from 'lucide-react';
import Cookies from 'js-cookie'
import { Badge } from '../ui/badge';
import StatusDot from '../ui/StatusDot';
import { Chatroom, GroupTypes, User } from '@/types';

const GroupNav = () => {
    // const { joinedGroupList } = useGetjoinedGroupList(userId as string);
    const { currentUser } = useGetProfileData()
    const {
        groupNotificationFlag,
        sendMsgGroupId,
        groupList,
        onlineUsers
    } = useMyContext()
    const { group: currentGroup, setGroup } = useContext(GroupContext)
    const { unreadMessages } = useMyContext()
    const pathname = usePathname()
    const settingsItems = [
        { name: "Edit profile", link: "/public_pages/Profile", icon: <Edit /> },
        {
            name: "Logout", link: "#", icon: <LogOut />,
            action: () => {
                Cookies.remove('access-token');
                window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public_pages/SignIn`
            }
        },
    ]
    const groupedUnreadMessages = unreadMessages.reduce((acc, message) => {
        if (!message.isRead && message.chatroom?._id) {
            const chatroomId = message.chatroom._id;
            if (!acc[chatroomId]) {
                acc[chatroomId] = {
                    chatroom: message.chatroom,
                    contact: message.contact, // Use 'contact' here instead of 'sender'
                    count: 0,
                };
            }
            acc[chatroomId].count += 1;
        }
        return acc;
    }, {} as Record<string, { chatroom: Chatroom; contact?: GroupTypes | User | any; count: number }>);

    const unreadMessageGroups = Object.values(groupedUnreadMessages);
    const unreadGroupIds = new Set(unreadMessageGroups.map(msg => msg?.contact?._id));


    return (
        <nav className='space-y-2  bg-[#013a6f] p-3 overflow-y-auto overflow-x-hidden h-full mb-5' style={{ scrollbarWidth: 'none' }}>

            <hr className='mx-2 rounded border-t-2 border-t-white/[0.06]' />

            {/* {data.map((server) => (
        <NavLink
          href={`/Groups/servers/${server.id}/channels/${server.categories[0].channels[0].id}`}
          key={server.id}
          // active={params.sid === server.id.toString()}
        >
          <Image width={48} height={48} src={`/servers/${server.img}`} alt='' />
        </NavLink>
      ))} */}

{/* 
            {unreadMessageGroups.map((message) => {
                const isChannel = message.chatroom.type === 'channel';
                const profilePic = isChannel ? message.contact?.group_picture : message.contact?.profile_pic;
                const name = isChannel ? message.contact?.name : message.contact?.username;

                return (
                    <NavLink key={message.chatroom._id} href={`${isChannel ? `/groups/${message.contact?._id}` : `/groups/direct/${message.chatroom._id}`}`}>
                        <div className="flex items-center relative">
                            <img
                                width={48}
                                height={48}
                                src={profilePic || '/default-profile.png'} // Fallback to a default image
                                className="object-fill w-full h-full"
                                alt={isChannel ? 'channel' : 'dm'}
                            />
                        </div>
                        <span className="absolute bottom-0 right-0 w-5 h-5 font-extrabold bg-orange-600 rounded-full grid place-content-center z-50">
                            {message.count}
                        </span>
                    </NavLink>
                );
            })} */}

            {groupList?.map((group) => {
                // // Check if the group_id exists in the unread messages
                // if (unreadGroupIds.has(group.group_id || group?._id)) {
                //     return null; // Skip rendering this group
                // }

                return (
                    <NavLink
                        href={`/groups/${group?.group_id}`}
                        key={group.group_id}
                    >
                        {(sendMsgGroupId === group?.group_id) && groupNotificationFlag && (
                            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#d4d6f3]" />
                        )}
                        <img width={48} height={48} src={group?.group_picture} className='object-fill w-full h-full' alt='group' />
                    </NavLink>
                );
            })}

            <hr className='mx-2 rounded border-t-2 border-t-white/[0.06]' />


            <GeneralLink>
                <GroupCreateDialog currentUser={currentUser} />
            </GeneralLink>

            <NavLink href='/groups/direct'>
                <span className='text-green-700'>DMs</span>
            </NavLink>
            <NavLink href='/'>
                <Home className='h-5 w-7 text-green-700' />
            </NavLink>
            <NavLink href='/groups/'>
                <Eye className='h-5 w-7' />
            </NavLink>
            <hr className='mx-2 rounded border-t-2 border-t-white/[0.06]' />
            {/* <NavLink href='/groups/'>
                <Verified className='h-5 w-7' />
            </NavLink> */}

            <div className='absolute bottom-0 mb-5 mb-2'>
                <Popover>
                    <PopoverTrigger>
                        <Avatar>
                            <AvatarImage src={currentUser?.profile_pic} className="bg-black w-[50px] h-[50px] rounded-full" />
                            <AvatarFallback>{iconTextGenerator(currentUser?.firstName as string, currentUser?.lastName as string)}</AvatarFallback>
                        </Avatar>
                        <StatusDot status={"online"} />
                    </PopoverTrigger>

                    <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                        {
                            settingsItems.map((item, index) => (
                                <Link href={item.link} key={index} className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100" onClick={item?.action}>
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))
                        }
                    </PopoverContent>
                </Popover>
            </div>
        </nav>
    );
}

function NavLink({
    href,
    children,
    active,
}: {
    href: string;
    children: ReactNode;
    active?: boolean;
}) {
    let pathName = usePathname();
    active ||= pathName === href;

    return (
        <Link href={href} className='group relative block'>
            <div className='absolute -left-3 flex h-full items-center'>
                <div
                    className={`${active
                        ? 'h-10'
                        : 'h-5 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                        }  w-1 origin-left  rounded-r bg-black transition-all duration-200 `}
                ></div>
            </div>

            <div className='group-active:translate-y-px'>
                <div
                    className={`${active
                        ? 'rounded-2xl bg-brand text-white'
                        : 'rounded-3xl bg-white text-gray-100 group-hover:rounded-2xl group-hover:bg-brand group-hover:text-white'
                        } flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-200`}
                >
                    {children}
                </div>
            </div>
        </Link>
    );
}

export function GeneralLink({
    children,
    active,
}: {
    children: ReactNode;
    active?: boolean;
}) {
    let pathName = usePathname();

    return (
        <>
            <div className='absolute -left-3 flex h-full items-center'>
                <div
                    className={`${active
                        ? 'h-10'
                        : 'h-5 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                        }  w-1 origin-left  rounded-r bg-white transition-all duration-200 `}
                ></div>
            </div>

            <div className='group-active:translate-y-px'>
                <div
                    className={`${active
                        ? 'rounded-2xl bg-brand text-white'
                        : 'rounded-3xl bg-white text-gray-100 group-hover:rounded-2xl group-hover:bg-brand group-hover:text-white'
                        } flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-200`}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

export default GroupNav
