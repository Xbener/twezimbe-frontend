'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GroupContext } from '@/context/GroupContext'
import React, { ChangeEvent, useContext, useState } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DoorOpen, MessageCircleWarning, Search, XCircle } from 'lucide-react'
import { useUpdateGroup } from '@/api/group'
import { useRouter } from 'next/navigation'
import { useGetProfileData } from '@/api/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'

type Props = {}

function GroupSettings({ }: Props) {
    const { group, admins, moderators, members } = useContext(GroupContext)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const { isLoading, updateGroup } = useUpdateGroup()
    const { currentUser } = useGetProfileData()
    const router = useRouter()
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [groupData, setGroupData] = useState({
        name: group?.group_name,
        description: group?.description,
        tags: group?.tags,
        group_type: group?.group_type
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGroupData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file !== undefined) setFile(file as File)
        setImagePreview(URL.createObjectURL(file as File));
    };


    const uploadPicture = async () => {
        try {
            if (file) {
                setUploading(true)
                const accessToken = Cookies.get('access-token');
                const formData = new FormData()
                formData.append('group_picture', file)
                formData.append('groupId', `${group?._id}`)
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/upload-group-picture`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: formData
                })

                let result = await res.json()
                if (!result.status) throw new Error()
                toast.success('Group Picture updated successfully')
                window.location.reload()
            } else {
                toast.error('please upload a file')
            }
        } catch (error) {
            toast.error("Error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    const changeVisibility = async (current_vis: string) => {
        try {
            setUploading(true)

            const res = await updateGroup({ group_state: current_vis, group_id: group?._id as string })
        } catch (error) {
            toast.error("An error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    const transitionToSacco = async () => {
        try {
            setUploading(true)

            const res = await updateGroup({ isSacco: !group?.isSacco, group_id: group?._id as string })
        } catch (error) {
            console.error("An error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateData = async () => {
        try {
            setUploading(true)
            const res = await updateGroup({ ...groupData, group_id: group?._id! })
            window.location.reload()
        } catch (error) {
            console.error("An error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    const handleLeaveGroup = async () => {
        try {
            setUploading(true)
            const accessToken = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/leave/${group?._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ userId: currentUser?._id })
            })

            let result = await res.json()
            if (!result.status) return toast.error(result.errors || result.message)
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups`

        }
        catch (error) {
            toast.error("Error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }



    const handleDeleteGroup = async () => {
        try {
            setUploading(true)
            const accessToken = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${group?._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })
            let result = await res.json()
            if (!result.status) return toast.error(result.errors || result.message)
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups`
        }
        catch (error) {
            toast.error("Error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }


    return (
        <div
            className='overflow-auto'
        >
            <div className='border-b border-white p-3 text-[1.2rem] flex items-center gap-2'>
                <Button disabled={uploading} onClick={() => router.back()}>
                    <XCircle color={"white"} />
                </Button>
                <h1 className='font-bold'>Settings</h1>
            </div>

            {
                group?.created_by[0]?._id === currentUser?._id && (
                    <div className='p-3 border-b flex flex-col md:flex-row items-start justify-around'>
                        <div className='flex justify-center text-center items-start gap-3 md:w-1/2 w-full'>
                            <div className="width-[200px] height-[200px] rounded-full">
                                <img
                                    src={imagePreview || group?.group_picture}
                                    alt=''
                                    className='object-cover w-[100px] h-[100px] rounded-full'
                                />

                            </div>
                            <div className='flex flex-col gap-2'>
                                <input
                                    name="picture"
                                    id="picture"
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                />
                                <p className='text-[0.8rem]'>Choose an image</p>
                                <Button className='bg-blue-500' disabled={uploading}>
                                    <label htmlFor="picture" className='cursor-pointer'>
                                        Choose picture
                                    </label>
                                </Button>

                                {
                                    imagePreview && (
                                        <Button className="border border-black text-black" disabled={uploading} onClick={uploadPicture}>
                                            Update
                                        </Button>
                                    )
                                }
                            </div>
                        </div>
                        <div className='flex flex-col gap-2 items-end md:w-1/2 w-full'>
                            <div className="w-full flex flex-col gap-2">
                                <label className='font-extrabold text-[.8rem]' htmlFor="group_name">Group name</label>
                                <input
                                    id="group_name"
                                    name="name"
                                    value={groupData?.name}
                                    onChange={handleChange}
                                    className="bg-transparent p-2 border outline-none w-full" placeholder="Group Name" />
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <label className='font-extrabold text-[.8rem]' htmlFor="description">Group description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={groupData?.description}
                                    onChange={handleChange}
                                    className="w-full bg-transparent p-2 border outline-none" placeholder="Group Description ..." />
                            </div>

                            <div className="w-full flex flex-col gap-2">
                                <label className='font-extrabold text-[.8rem]' htmlFor="tags">Group tags (separate by comma)</label>
                                <textarea
                                    id="tags"
                                    name="tags"
                                    value={groupData?.tags}
                                    onChange={handleChange}
                                    className="w-full bg-transparent p-2 border outline-none" placeholder="Group Tags (separate by ,)..." />
                            </div>

                            <Select onValueChange={(e) => setGroupData(prev => ({ ...prev, group_type: e }))} defaultValue={groupData.group_type}>
                                <SelectTrigger className="bg-transparent w-full text-white">
                                    <SelectValue placeholder="Group category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem className="cursor-pointer" value="Social">Social</SelectItem>
                                    <SelectItem className="cursor-pointer" value="Professional">Professional</SelectItem>
                                    <SelectItem className="cursor-pointer" value="Educational">Educational</SelectItem>
                                    <SelectItem className="cursor-pointer" value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* {
                                groupData.group_type && (
                                    <input
                                        name="group_type"
                                        value={groupData?.group_type}
                                        onChange={handleChange}
                                        className="bg-transparent p-2 border outline-none w-full" placeholder="Justify Your answer" />
                                )
                            } */}

                            <div>
                                <Button disabled={uploading} onClick={handleUpdateData} className='bg-blue-500 text-white'>Update</Button>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className='p-3 border-b  w-full'>
                <h1 className='p-2 text-[1.2rem] font-extrabold'>Notification Settings</h1>

                <div className='flex flex-col gap-3 w-full mt-5'>

                    <div className='flex w-full justify-between items-center'>
                        <h1>Push Email Notifications </h1>

                        <div>
                            <Select>
                                <SelectTrigger className="bg-transparent w-full text-white">
                                    <SelectValue placeholder="Email notifications" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem className="cursor-pointer" value="push">push</SelectItem>
                                    <SelectItem className="cursor-pointer" value="none">Don't push</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex w-full justify-between items-center'>
                        <h1>Message Notifications </h1>

                        <div>
                            <Select>
                                <SelectTrigger className="bg-transparent w-full text-white">
                                    <SelectValue placeholder="Message Notifications" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem className="cursor-pointer" value="all">All Messages</SelectItem>
                                    <SelectItem className="cursor-pointer" value="mentions">Only @mentions</SelectItem>
                                    <SelectItem className="cursor-pointer" value="none">Don't push message Notifications</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex w-full justify-between items-center'>
                        <h1>Push Events Notifications </h1>

                        <div>
                            <Select>
                                <SelectTrigger className="bg-transparent w-full text-white">
                                    <SelectValue placeholder="Events notifications" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem className="cursor-pointer" value="push">push</SelectItem>
                                    <SelectItem className="cursor-pointer" value="none">Don't push</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className='p-3 border-b  w-full'>
                <h1 className='p-2 text-[1.2rem] font-extrabold'>Quick Actions</h1>
                <div className="w-full flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger>
                            <Button className="w-full bg-orange-700 text-white">Manage admins</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-black">
                            <DialogHeader>
                                Manage Group Admins
                            </DialogHeader>

                            <div className="w-full flex flex-col gap-2">
                                <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                                    <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                                    <Search />
                                </div>

                                {
                                    members?.map((member) => (
                                        <div className="w-full flex items-center justify-between hover:bg-gray-50">
                                            <h1>{member.firstName} {member.lastName}</h1>

                                            <input
                                                type="checkbox"
                                                checked={member.role === 'GroupManager'}
                                            />
                                        </div>
                                    ))
                                }
                            </div>

                            <DialogClose>
                                <Button>Close</Button>
                            </DialogClose> 
                             <DialogClose>
                                <Button>Confirm</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger>
                            <Button className="w-full bg-orange-700 text-white">Manage Moderators</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-black">
                            <DialogHeader>
                                Manage Group Moderators
                            </DialogHeader>

                            <div className="w-full flex flex-col gap-2">
                                <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                                    <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                                    <Search />
                                </div>

                                {
                                    members?.map((member) => (
                                        <div className="w-full flex items-center justify-between hover:bg-gray-50">
                                            <h1>{member.firstName} {member.lastName}</h1>

                                            <input
                                                type="checkbox"
                                                checked={member.role === 'GroupModerator'}
                                            />
                                        </div>
                                    ))
                                }
                            </div>

                            <DialogClose>
                                <Button>Close</Button>
                            </DialogClose>
                            <DialogClose>
                                <Button>Confirm</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger>
                            <Button className="w-full bg-orange-700 text-white">Manage Users</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-black">
                            <DialogHeader>
                                Manage Group Members
                            </DialogHeader>

                            <div className="w-full flex flex-col gap-2">
                                <div className="flex items-center bg-[#013a6fae] sticky top-0 z-20 p-2 justify-between text-neutral-200 w-full">
                                    <input className='bg-transparent outline-none w-full' placeholder='Search ...' />
                                    <Search />
                                </div>

                                {
                                    members?.map((member) => (
                                       member?.role != "GroupManager" && (
                                            <div className="w-full flex items-center justify-between hover:bg-gray-50">
                                                <h1>{member.firstName} {member.lastName}</h1>

                                                <Button className="bg-red-500 text-white">Kick</Button>
                                            </div>
                                       )
                                    ))
                                }
                            </div>

                            <DialogClose>
                                <Button>Close</Button>
                            </DialogClose>
                            <DialogClose>
                                <Button>Confirm</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </div>
            </div> */}

            <div className='p-3 border-b  w-full'>
                <h1 className='p-2 text-[1.2rem] font-extrabold'>Privacy Settings</h1>

                <div className='flex flex-col gap-3 w-full mt-5'>

                    {
                        group?.created_by[0]?._id === currentUser?._id && (
                            <div className='flex w-full justify-between items-center'>
                                <h1>Change Visibility ({group?.group_state})</h1>

                                <div>
                                    <Select
                                        disabled={uploading}
                                        defaultValue={group?.group_state}
                                        onValueChange={(e) => changeVisibility(e)}
                                    >
                                        <SelectTrigger className="bg-transparent w-full text-white">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem className="cursor-pointer" value="Public">Public</SelectItem>
                                            <SelectItem className="cursor-pointer" value="Private">Private</SelectItem>
                                            <SelectItem className="cursor-pointer" value="Invite-Only">Secret</SelectItem>
                                        </SelectContent>
                                    </Select>

                                </div>
                            </div>
                        )
                    }
                    {
                        group?.created_by[0]?._id === currentUser?._id && (
                            <div className='flex w-full justify-between items-center'>
                                <div className="flex flex-col gap-1">
                                    <h1>
                                        {group?.isSacco ? "Remove SACCO" : "Transition to SACCO"}
                                    </h1>
                                    <p className="text-[.8rem]">{group?.isSacco ? "This group is already a SACCO" : `You need at least 5 members of a group to transition to sacco. Currently you have ${group?.members.length} members`}</p>
                                </div>
                                <div>
                                    <Button disabled={uploading} className={`bg-blue-500 text-white`} onClick={transitionToSacco}>
                                        {group?.isSacco ? "Remove SACCO" : "Transition"}
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    <div className='flex w-full justify-between items-center'>
                        <h1>Copy Invite Link</h1>
                        <Button disabled={uploading} className='bg-blue-500 text-white' onClick={() => {
                            navigator.clipboard.writeText(group?.invite_link as string)
                                .then(() => {
                                    console.log('Text copied to clipboard');
                                    toast.success("Invite link successfully copied to clipboard!")
                                })
                                .catch(err => {
                                    console.error('Failed to copy: ', err);
                                });
                        }}>
                            Copy Link
                        </Button>
                    </div>

                    {
                        group?.created_by[0]?._id === currentUser?._id && (
                            <div className='flex w-full justify-between items-center'>
                                <h1>Delete Group </h1>
                                <Dialog>
                                    <DialogTrigger disabled={uploading}>
                                        <Button disabled={uploading} className='bg-red-500 text-white flex items-center gap-1'>
                                            <MessageCircleWarning />
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white text-black">
                                        <DialogHeader>
                                            {/* <Warn */}
                                            Confirm Deleting this Group
                                        </DialogHeader>
                                        <div>
                                            <DialogClose>
                                                <Button disabled={uploading}>
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button disabled={uploading} className="bg-red-500 text-white" onClick={handleDeleteGroup} >
                                                Confirm
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                            </div>
                        )
                    }

                    <div className='flex w-full justify-between items-center'>
                        <h1>Leave Group </h1>
                        <Dialog>
                            <DialogTrigger disabled={uploading}>
                                <Button disabled={uploading} className='bg-red-500 text-white flex items-center gap-1'>
                                    <MessageCircleWarning />
                                    Leave
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white text-black">
                                <DialogHeader>
                                    {/* <Warn */}
                                    Confirm Leaving this Group
                                </DialogHeader>
                                <div>
                                    <DialogClose>
                                        <Button disabled={uploading}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button disabled={uploading} className="bg-red-500 text-white" onClick={handleLeaveGroup} >
                                        Confirm
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className='p-3 border-b  w-full '>
                <h1 className='p-2 text-[1.2rem] font-extrabold'>About</h1>
                <div className='flex flex-col gap-3 w-full mt-5 mb-11'>
                    <div>
                        <h1><span className='font-bold'>Name:</span> {group?.group_name}</h1>
                    </div>

                    <div>
                        <h1><span className='font-bold'>State:</span> {group?.group_state}</h1>
                    </div>

                    <div>
                        <h1><span className='font-bold'>Total Members:</span> {group?.members.length}</h1>
                    </div>
                    <div>
                        <h1><span className='font-bold'>Created on:</span> {new Date(group?.createdAt as Date).toLocaleDateString()}</h1>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default GroupSettings