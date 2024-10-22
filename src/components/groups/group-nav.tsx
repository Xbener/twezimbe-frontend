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
import { Edit, LogOut } from 'lucide-react';
import Cookies from 'js-cookie'
import { Badge } from '../ui/badge';
import StatusDot from '../ui/StatusDot';

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

            {groupList?.map((group) => (
                <NavLink
                    // href={`/Groups/servers/${group.group_id}/channels/${server.categories[0].channels[0].id}`}
                    href={`/groups/${group?.group_id}`}
                    key={group.group_id}
                // active={params.sid === group.group_id.toString()}
                >
                    {(sendMsgGroupId === group?.group_id) && groupNotificationFlag && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#d4d6f3]" />
                    )}
                    <img width={48} height={48} src={group?.group_picture} className='object-fill w-full h-full' alt='group' />
                </NavLink>
            ))}

            <hr className='mx-2 rounded border-t-2 border-t-white/[0.06]' />

            <GeneralLink>
                <GroupCreateDialog currentUser={currentUser} />
            </GeneralLink>

            <NavLink href='/groups/direct'> 
                <span className='text-black'>DMs</span>
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
