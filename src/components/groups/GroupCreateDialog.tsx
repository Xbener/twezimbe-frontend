"use client"
import { useGetAllUsers } from "@/api/auth"
import { useAddGroup } from "@/api/group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from "axios"
import { ImageIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { z } from 'zod'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Plus } from "./icons"
import { useGetProfileData } from "@/api/auth"

const formSchema = z.object({
    name: z.string().optional(),
    group_type: z.string().optional(),
    group_state: z.string().optional(),
    tags: z.string().optional(),
    description: z.string().optional(),
    created_by: z.string().optional(),
});

export type GroupFormData = z.infer<typeof formSchema>;

type Props = {
    currentUser?: User,
}

interface SelectValue {
    value: string;
    label: string;
}

const GroupCreateDialog = ({ }: Props) => {

    const { currentUser } = useGetProfileData();
    const { addGroup, isSuccess } = useAddGroup();

    // const { allUsers } = useGetAllUsers()
    const allUsers = [currentUser]

    const [selectedUsersId, setSelectedUsersId] = useState<string[]>([])
    const [groupName, setGroupName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [renderedImage, setRenderedImage] = useState("")

    const [step, setStep] = useState<number>(1)
    const imgRef = useRef<HTMLInputElement>(null)
    const dialogCloseRef = useRef<HTMLButtonElement>(null)

    const [group_type, setGroupType] = useState<SelectValue>({
        value: 'Social' as string,
        label: 'Social' as string
    });

    const [group_state, setGroupState] = useState<SelectValue>({
        value: 'Public' as string,
        label: 'Public' as string
    });

    const form = useForm<GroupFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            created_by: currentUser?._id
        }
    });

    useEffect(() => {
        setSelectedUsersId([`${currentUser?._id}`])
    }, [currentUser])


    const onSubmit = async (GroupData: GroupFormData) => {

        const formData = new FormData();
        let groupAvatar = '';
        // if (selectedImage) {
        //     formData.append("file", selectedImage);
        //     try {
        //         const { data: { fileName } } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/`, formData,
        //             {
        //                 headers: {
        //                     'Content-Type': 'multipart/form-data'
        //                 }
        //             }
        //         );
        //         groupAvatar = fileName;
        //         console.log("avatar", groupAvatar);

        //     }
        //     catch (e) {
        //         console.error('File not uploaded', 'Error')
        //     }
        // }

        var newData = {
            ...GroupData,
            name: groupName,
            group_type: group_type?.value,
            group_state: group_state?.value,
            selectedUsers_Id: selectedUsersId,
            created_by: currentUser?._id,
            // group_avatar: groupAvatar === "" ? "default" : groupAvatar
        }

        const res = await addGroup(newData)
        if (res.group._id !== null) {
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${res.group._id}`
        }
    }


    useEffect(() => {
        if (!selectedImage) {
            return setRenderedImage("")
        }
        const reader = new FileReader()
        reader.onload = (e) => setRenderedImage(e.target?.result as string)
        reader.readAsDataURL(selectedImage)
    }, [selectedImage])

    return (
        <Dialog>
            <DialogTrigger>
                <div>
                    <Plus className='h-5 w-7' />
                </div>
            </DialogTrigger>
            <DialogContent className="bg-[#e3e2de] max-w-2xl max-h-[900px]">
                <DialogHeader>
                    {/* TODO: <DialogClose /> will be here */}
                    <DialogClose ref={dialogCloseRef} />
                    <DialogTitle>Create Group</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 bg-[#e3e2de]'>

                        {renderedImage && (
                            <div className="w-16 h-16 relative mx-auto">
                                <Image
                                    src={renderedImage}
                                    fill
                                    alt="user image"
                                    className="rounded-full object-cover"
                                />
                            </div>
                        )}
                        {/* TODO: input file */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={imgRef}
                            hidden
                            onChange={(e) => setSelectedImage(e.target.files![0])}
                        />

                        {step === 1 && (
                            <>
                                <div className="flex flex-col gap-3 overflow-auto max-h-[500px] max-w-screen-2xl">
                                    {allUsers?.map((user) => (
                                        <FormField
                                            control={form.control}
                                            name='name'

                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Group Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field}
                                                            name="name"
                                                            value={groupName}
                                                            onChange={(e) => setGroupName(e.target.value)}
                                                            className="bg-white border-2 placeholder:text-gray-600" placeholder="Group Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between text-white">
                                    <DialogClose>
                                        <Button variant={"outline"} type="button" className="bg-transparent border-orange-500 text-orange-500">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                        variant={"outline"}
                                        className="bg-blue-500 text-white hover:bg-gray-500"
                                        disabled={
                                            selectedUsersId.length === 0 ||
                                            (selectedUsersId.length > 1 && !groupName) ||
                                            isLoading
                                        }
                                        onClick={() => setStep(2)}>Next</Button>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <FormField

                                    control={form.control}
                                    name='created_by'
                                    render={({ field }) => (
                                        <FormItem hidden>
                                            <FormControl>
                                                <Input defaultValue={currentUser?._id} value={currentUser?._id} hidden />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />


                                <FormField
                                    control={form.control}
                                    name='group_type'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Type</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={group_type}
                                                    onChange={(e) => setGroupType(e as SelectValue)}
                                                    options={
                                                        [
                                                            { value: "Social", label: "Social" },
                                                            { value: "Professional", label: "Professional" },
                                                            { value: "Educational", label: "Educational" },
                                                            { value: "Other", label: "Other" },
                                                        ]
                                                    }
                                                    primaryColor="blue"

                                                />

                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='group_state'

                                    render={({ field }) => (
                                        <FormItem className="bg-[#e3e2de]">
                                            <FormLabel>Group State</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={group_state}
                                                    onChange={(e) => setGroupState(e as SelectValue)}
                                                    options={
                                                        [
                                                            { value: "Public", label: "Public" },
                                                            { value: "Private", label: "Private" },
                                                        ]
                                                    }
                                                    primaryColor="#e3e2de"
                                                />

                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='tags'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Tags</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white border-2 placeholder:text-gray-600" placeholder="Group Tags" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} className="bg-white border-2 placeholder:text-gray-600" placeholder="Group Description" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">

                                    {/* {isLoading ? <LoadingButton /> : <Button type='submit' className='text-white px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-400 font-bold'>Create</Button>} */}
                                </div>
                                <div className="flex justify-between text-white">
                                    <Button variant={"outline"} type="button" className="bg-transparent border-orange-500 text-orange-500" onClick={() => setStep(1)}>Prev</Button>
                                    <Button
                                        // onClick={handlCreateConversation}
                                        type='submit'
                                        disabled={
                                            selectedUsersId.length === 0 ||
                                            (selectedUsersId.length > 1 && !groupName) ||
                                            isLoading
                                        }
                                        className="bg-blue-500  text-white"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-t-2 border-b-2  rounded-full animate-spin" />
                                        ) : (
                                            "Create"
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
export default GroupCreateDialog