import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DMContext } from '@/context/DMContext'
import { GroupContext } from '@/context/GroupContext'
import { GroupTypes } from '@/types'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { PlusIcon, Search } from 'lucide-react'
import React, { useContext, useState, useEffect } from 'react'
import { iconTextGenerator } from '@/lib/iconTextGenerator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMyContext } from '@/context/MyContext';
import StatusDot from '@/components/ui/StatusDot';
import { User } from '@/types';
import { useGetProfileData } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { checkIsActive } from '@/components/groups/GroupMemberItem'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import handlecreateDirectMessage from '@/lib/createDM'



function Aside({ }) {
    const { group } = useContext(GroupContext)
    const [q, setQ] = useState('')
    const { allUsers, currentUser, setCurrentDM, currentDM } = useContext(DMContext)
    const { onlineUsers, setUserDMs, userDMs, setMessages } = useMyContext()
    const [loading, setLoading] = useState(false)
    const router = useRouter()



    const handleGetUserDms = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                },
                body: JSON.stringify({ type: 'dm', userId: currentUser?._id }),
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.errors || data.messaga || "failed")
            setUserDMs(data.chatrooms)

        } catch (error) {
            toast.error('failed')
            console.log(error)
        }
    }

    useEffect(() => {
        if (currentUser) handleGetUserDms()
    }, [currentUser])
    return (
        <div className='w-[35%] md:w-[20%] bg-[#013a6fd8] h-full text-neutral-200 capitalize relative hidden sm:block'>
            <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                <input name="q" onChange={(e) => setQ(e.target.value)} className='bg-transparent outline-none w-full' placeholder='Find a conversation ...' />
                <Search />
            </div>

            <div className='w-full p-2'>
                <div className='w-full flex items-center justify-between'>
                    <h1>Direct messages</h1>
                    <Dialog >
                        <DialogTrigger>
                            <PlusIcon />
                        </DialogTrigger>

                        <DialogContent className="w-full p-2 mt-5 bg-white text-black">
                            <DialogHeader>
                                <Input
                                    placeholder="Start a DM"
                                />
                            </DialogHeader>
                            {
                                allUsers?.length! <= 0 ? "no users found" : allUsers?.map((user, index) => {
                                    return (
                                        <Popover>
                                            <PopoverTrigger className='flex items-center justify-normal gap-5 relative'>
                                                <div className='flex items-center justify-normal gap-5 p-3 w-full cursor-pointer hover:bg-[#6bb7ff73] duration-150 rounded-lg'>
                                                    <Avatar>
                                                        <AvatarImage src={user.profile_pic} className="bg-black" />
                                                        <AvatarFallback>{iconTextGenerator(user?.firstName as string, user?.lastName as string)}</AvatarFallback>
                                                    </Avatar>
                                                    <h1 className='text-[.9rem]'>{user.firstName} {user.lastName}</h1>
                                                    <PopoverContent className="bg-[#013a6f] text-white flex flex-col items-center p-5 gap-2 border-transparent shadow-lg rounded-lg">
                                                        <Avatar className='w-[100px] h-[100px]'>
                                                            <AvatarImage src={user.profile_pic} className="bg-black" />
                                                            <AvatarFallback>{iconTextGenerator(user?.firstName as string, user?.lastName as string)}</AvatarFallback>
                                                        </Avatar>
                                                        <h1 className="text-[1.4rem] font-bold">{user.firstName} {user.lastName}</h1>
                                                        <div>{checkIsActive(onlineUsers, user) ?
                                                            <div className="flex items-center gap-2"><span className='w-3 h-3 border rounded-full bg-green-500'></span> online</div> :
                                                            <div className="flex items-center gap-2"><span className='w-3 h-3 border rounded-full bg-gray-500'></span> offline</div>}
                                                        </div>
                                                        <Button
                                                            disabled={loading}
                                                            onClick={() => handlecreateDirectMessage(user, currentUser as User, router)}
                                                            className="bg-blue-500 text-white  place-self-start w-full">
                                                            Send message
                                                        </Button>

                                                    </PopoverContent>
                                                </div>
                                            </PopoverTrigger>
                                        </Popover>
                                    )
                                })
                            }
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="dm-list-container mt-5">
                    {!userDMs.length ? (
                        <div className="no-dms text-neutral-400">
                            No direct messages found
                        </div>
                    ) : (
                        userDMs.map((dm, index) => {
                            // Find the user that is not the current user
                            const chatPartner = dm?.memberDetails.find(
                                (member) => member._id !== currentUser?._id
                            );

                            return (
                                <div
                                    onClick={() => {
                                       if(currentDM?._id!==dm?._id){
                                           setMessages([])
                                           setCurrentDM(dm)
                                           router.push(`/groups/direct/${dm?._id}`)
                                       }
                                    }}
                                    key={index}
                                    className={`dm-item flex items-center rounded-md p-2 hover:bg-[rgba(62,175,255,0.31)] cursor-pointer ${currentDM?._id === dm?._id && 'bg-[rgba(62,175,255,0.31)]'}`}>
                                    <img
                                        src={chatPartner?.profile_pic}
                                        alt={chatPartner?.firstName}
                                        className="profile-pic w-8 h-8 rounded-full mr-3"
                                    />
                                    <div className="dm-details flex flex-col">
                                        <span className="user-name text-white font-medium">
                                            {`${chatPartner?.firstName} ${chatPartner?.lastName}`}
                                        </span>
                                        <span className="last-message text-neutral-400 text-sm">
                                            Last message preview here
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div >
    )
}

export default Aside