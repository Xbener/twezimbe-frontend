'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GroupContext } from '@/context/GroupContext'
import React, { ChangeEvent, useContext, useState } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DoorOpen, MessageCircleWarning, XCircle } from 'lucide-react'
import { useUpdateGroup } from '@/api/group'
import { useRouter } from 'next/navigation'
import { useGetProfileData } from '@/api/auth'

type Props = {}

function GroupSettings({ }: Props) {
    const { group } = useContext(GroupContext)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const { isLoading, updateGroup } = useUpdateGroup()
    const { currentUser } = useGetProfileData()
    const router = useRouter()
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [groupData, setGroupData] = useState({
        name: group?.group_name,
        description: group?.description
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
        } catch (error) {
            console.error("An error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div
            className=''
        >
            <div className='border-b border-white p-3 text-[1.2rem] flex items-center gap-2'>
                <Button disabled={uploading} onClick={() => router.back()}>
                    <XCircle color={"white"} />
                </Button>
                <h1 className='font-bold uppercase'>Settings</h1>
            </div>

            {
                group?.created_by[0]?._id === currentUser?._id && (
                    <div className='p-3 border-b flex items-start justify-around'>
                        <div className='flex justify-center text-center items-start gap-3'>
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
                        <div className='w-1/2 flex flex-col gap-2 items-end'>
                            <div className="w-full flex flex-col gap-2">
                                <label className='uppercase font-extrabold text-[.8rem]' htmlFor="group_name">Group Name</label>
                                <input
                                    id="group_name"
                                    name="name"
                                    value={groupData?.name}
                                    onChange={handleChange}
                                    className="bg-transparent p-2 border outline-none w-full" placeholder="Group Name" />
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <label className='uppercase font-extrabold text-[.8rem]' htmlFor="description">Group Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={groupData?.description}
                                    onChange={handleChange}
                                    className="w-full bg-transparent p-2 border outline-none" placeholder="Group Description ..." />
                            </div>

                            <div>
                                <Button disabled={uploading} onClick={handleUpdateData} className='bg-blue-500 text-white'>Update</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className='p-3 border-b  w-full'>
                <h1 className='p-2 text-[1.2rem] font-extrabold uppercase'>Privacy Settings</h1>

                <div className='flex flex-col gap-3 w-full mt-5'>
                    {
                        group?.created_by[0]?._id === currentUser?._id && (
                            <div className='flex w-full justify-between items-center'>
                                <h1>Change Visibility ({group?.group_state})</h1>

                                <div>
                                    <Button disabled={uploading} className={`bg-${group?.group_state === 'Public' ? 'blue-500' : 'neutral-50'} text-white px-3 py-2 rounded-md transition duration-300 ease-in-out ${group?.group_state === 'public' ? 'hover:bg-blue-600' : ''}`}
                                        onClick={() => changeVisibility(group?.group_state === 'Public' ? 'Private' : 'Public')}
                                    >
                                        {group?.group_state === 'Public' ? 'Make Private' : 'Make Public'}
                                    </Button>
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
                                <Button disabled={uploading} className='bg-red-500 text-white flex items-center gap-1'>
                                    <MessageCircleWarning />
                                    Delete
                                </Button>
                            </div>
                        )
                    }

                    <div className='flex w-full justify-between items-center'>
                        <h1>Leave Group </h1>
                        <Button disabled={uploading} className='bg-red-500 text-white flex items-center gap-1'>
                            <DoorOpen />
                            Leave
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default GroupSettings