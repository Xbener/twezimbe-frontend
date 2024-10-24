'use client'
import { useGetProfileData } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GroupContext } from '@/context/GroupContext'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { Bell, Edit, Lock, LogOut, MessageCirclePlus, PlusIcon, Settings, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { userInfo } from 'os'
import React, { useContext, useState } from 'react'
import Cookies from 'js-cookie'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { useMyContext } from '@/context/MyContext'
import { channel } from 'diagnostics_channel'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAddChannel } from '@/api/channel'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {

}



function ChannelDetails({ }: Props) {
    const { group, isMemberListOpen, setIsMemberListOpen } = useContext(GroupContext)
    const { channelList, setChannelList, members, setCurrentChannel, currentChannel, setChId, setRoomId } = useMyContext()
    const router = useRouter()
    const { currentUser } = useGetProfileData()
    const { addChannel, isError, isLoading, isSuccess } = useAddChannel()
    const [channelFields, setChannelFields] = useState({
        name: '',
        description: '',
        state: '',
    })

    const handleChannelFieldChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setChannelFields((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAddChannel = async () => {
        try {
            const res = await addChannel({ ...channelFields, groupId: group?._id, members })
            if (isError) return toast.error(res.errors || res.message)
            if (res.status) {
                window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${group?._id}/room/${res.channel._id}`
            }
        } catch (error) {
            toast.error("Something went wrong")
            console.log(error)
        }
    }

    // function makePayment() {
    //     FlutterwaveCheckout({
    //         public_key: "FLWPUBK_TEST-61fd8c76063ac4c81570ea26a682c719-X",
    //         tx_ref: "txref-DI0NzMx13",
    //         amount: 50000,
    //         currency: "UGX",
    //         payment_options: "mobilemoneyrwanda, mobilemoneyuganda, card, account, banktransfer",
    //         meta: {
    //             source: "docs-inline-test",
    //             consumer_mac: "92a3-912ba-1192a",
    //         },
    //         customer: {
    //             email: currentUser?.email,
    //             phone_number: `+250781500709`,
    //             name: `${currentUser?.firstName} ${currentUser?.lastName}`,
    //         },
    //         customizations: {
    //             title: "Group Premium",
    //             description: "Upgrade to Group Premium to have access to more features!",
    //             logo: "https://checkout.flutterwave.com/assets/img/rave-logo.png",
    //         },
    //         callback: () => handleUpgrade(),
    //         onclose: function () {
    //             console.log("Payment cancelled!");
    //         }
    //     });
    // }

    const handleUpgrade = async () => {
        const groupId = group?._id
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId }),
        });
        const { id, url } = await res.json();
        window.location.href = `${url}`;
    };



    const menuItems = [
        { name: "Group settings", link: `/groups/${group?._id}/settings`, icon: <Settings />, privilege: 'user' },
        { name: "Group Join requests", link: `/groups/${group?._id}/requests`, icon: <MessageCirclePlus />, privilege: 'admin' },
        { name: "Upgrade Plan", link: `#`, onClick: () => handleUpgrade(), icon: <Upload />, privilege: 'admin' },
    ]

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

    const filteredMenuItems = menuItems.filter(item => {
        if (item.name === "Upgrade Plan" && group?.upgraded) {
            return false;
        }
        return item.privilege !== 'admin' || (currentUser?._id === group?.created_by[0]?._id);
    });
    return (
        <>

            <Popover>
                <PopoverTrigger className="w-full">
                    <div className='w-full shadow-md text-[1.2rem] cursor-pointer font-extrabold  p-2 flex items-center justify-between'>
                        {
                            isMemberListOpen && (
                                <span className="p-2 cursor-pointer" onClick={() => setIsMemberListOpen(false)}>
                                    <X />
                                </span>
                            )
                        }
                        {group?.group_name}
                        <CaretDownIcon className='w-[20px] ' />
                    </div>
                    <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                        {filteredMenuItems.map((item, index) => (
                            <Link
                                onClick={(e) => {
                                    if (item.onClick) {
                                        e.preventDefault()
                                        item.onClick()
                                    }
                                }}
                                href={item.link}
                                key={index}
                                className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100"
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        ))}
                    </PopoverContent>
                </PopoverTrigger>
            </Popover>

            {/* channels */}

            <div className='w-full p-2 flex flex-col mt-5 h-full overflow-y-auto absolute'>
                <span className='flex items-center justify-between font-extrabold text-[0.9rem]'>
                    Channels
                    <Dialog>
                        <DialogTrigger>
                            <Button disabled={isLoading}
                                className='cursor-pointer hover:bg-gray-50 rounded-full hover:text-black'>
                                <PlusIcon />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                            <DialogHeader className='font-bold text-[1.2rem]'>
                                Create a new channel
                            </DialogHeader>
                            <div className='w-full flex flex-col gap-2'>
                                <Input value={channelFields.name} onChange={handleChannelFieldChange} name="name" placeholder='Enter channel name' />
                                <Textarea value={channelFields.description} onChange={handleChannelFieldChange} name="description" placeholder='Enter channel description ...' />
                                <Select value={channelFields.state} name='state' onValueChange={(v) => setChannelFields(prev => ({ ...prev, state: v }))}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Privacy" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="public">Public</SelectItem>
                                        <SelectItem className="cursor-pointer" value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <DialogClose>
                                    <Button disabled={isLoading} className='border border-orange-500 text-orange-500'>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button disabled={isLoading} className='bg-orange-500 text-white' onClick={handleAddChannel}>
                                    Continue
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </span>

                <div className="flex flex-col gap-4">
                    <div className='w-full p-2 flex flex-col gap-2'>
                        <h1 className='text-[1.2rem] sm:text-[1rem]'>Public channels</h1>
                        <div className='w-full flex flex-col'>
                            {
                                channelList?.map((channel, index) => channel.state?.toLowerCase() === 'public' && (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setCurrentChannel(channel)
                                            setRoomId(channel?.chatroom?._id!)
                                            router.push(`/groups/${group?._id}/room/${channel._id}`)
                                            // setChId(channel?._id)

                                        }}
                                        className={`flex text-[.9rem] items-center gap-2 w-full hover:bg-neutral-50 hover:text-gray-700 duration-100 cursor-pointer p-2 rounded-md ${currentChannel?._id === channel?._id ? 'bg-white text-black hover:bg-[rgba(255,255,255,0.27)] hover:text-white' : ''}`}
                                    >
                                        <span>{channel?.state === 'public' ? "#" : <Lock className='' />}</span>
                                        {channel.name}
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className='w-full p-2 flex flex-col mb-80'>
                        <h1 className='text-[1.2rem] sm:text-[1rem]'>Private channels</h1>
                        <div className='w-full flex flex-col'>

                            {
                                channelList?.map((channel, index) => channel?.state?.toLowerCase() === 'private' && (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setCurrentChannel(channel)
                                            setRoomId(channel?.chatroom?._id!)
                                            router.push(`/groups/${group?._id}/room/${channel._id}`)
                                            // setChId(channel?._id)
                                        }
                                        }
                                        className={`flex text-[.9rem] items-center gap-2 w-full hover:bg-neutral-50 hover:text-gray-700 duration-100 cursor-pointer p-2 rounded-md ${currentChannel?._id === channel?._id ? 'bg-white text-black hover:bg-[rgba(255,255,255,0.21)] hover:text-white' : ''}`}
                                    >
                                        <span><Lock /></span>
                                        {channel.name}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className='absolute bottom-0 w-full bg-[#013a6f] h-auto flex items-center justify-start gap-2  p-2'>
                {/* <Avatar>
                    <AvatarImage src={currentUser?.profile_pic} className="bg-black w-[50px] h-[50px] rounded-full" />
                    <AvatarFallback>{iconTextGenerator(currentUser?.firstName as string, currentUser?.lastName as string)}</AvatarFallback>
                </Avatar> */}
                <div className="flex items-center gap-2 justify-between w-full">
                    <h1>{currentUser?.firstName} {currentUser?.lastName}</h1>
                    <Popover>
                        <PopoverTrigger>
                            <Button disabled={isLoading}>
                                <Settings />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="text-white bg-[#013a6f] shadow-2xl z-40 gap-1 flex flex-col border-transparent border-l-8 border-l-neutral-400 pl-3 ">
                            {
                                settingsItems.map((item: any, index: number) => (
                                    <Link href={item.link} key={index} className="text-white flex p-2 w-full text-[1.1rem] hover:bg-[#6bb7ff73] cursor-pointer rounded-md items-center gap-2 duration-100" onClick={item?.action}>
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))
                            }
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    )
}

export default ChannelDetails