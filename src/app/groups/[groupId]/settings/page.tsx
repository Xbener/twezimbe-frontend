'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GroupContext } from '@/context/GroupContext'
import React, { useContext, useState } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type Props = {}

function GroupSettings({ }: Props) {
    const { group } = useContext(GroupContext)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    return (
        <div
            className=''
        >
            <div className='border-b border-white p-3 text-[1.2rem]'>
                <h1 className='font-bold'>Group Settings</h1>
            </div>

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
                <div className="flex flex-col gap-2">
                    <label className='uppercase font-extrabold text-[.8rem]' htmlFor="group_name">Group Name</label>
                    <input
                        id="group_name"
                        name="name"
                        value={group?.group_name}
                        // onChange={(e) => setGroupName(e.target.value)}
                        className="bg-transparent p-2 border outline-none" placeholder="Group Name" />
                </div>
            </div>
        </div>
    )
}

export default GroupSettings