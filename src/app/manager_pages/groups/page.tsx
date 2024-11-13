'use client'
import { deleteGroup, handleGroupSuspension, useAddGroup, useGetAllGroups } from '@/api/group'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { GroupTypes } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import Select from 'react-tailwindcss-select'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

type Props = {}

const formSchema = z.object({
    name: z.string(),
    group_type: z.string().optional(),
    group_state: z.string().optional(),
    tags: z.string().optional(),
    description: z.string(),
    created_by: z.string(),
});

export type GroupFormData = z.infer<typeof formSchema>;


interface SelectValue {
    value: string;
    label: string;
}


function page({ }: Props) {
    const { isLoading, groups, setGroups, setSelectedGroup, currentUser } = useContext(AdminContext)
    const [groupName, setGroupName] = useState("")
    const { addGroup } = useAddGroup()
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' })
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
            created_by: currentUser?._id! || ''
        }
    });
    const router = useRouter()

    const onSubmit = async (GroupData: GroupFormData) => {

        var newData = {
            ...GroupData,
            name: groupName,
            group_type: group_type?.value,
            group_state: group_state?.value,
            selectedUsers_Id: [currentUser?._id as string],
            created_by: currentUser?._id,
        }

        const res = await addGroup(newData)
        if (res.group._id !== null) {
            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${res.group._id}`
        }
    }

    const handleSort = (key: string) => {
        if (groups) {
            let direction = 'asc'
            if (sortConfig.key === key && sortConfig.direction === 'asc') {
                direction = 'desc'
            }
            setSortConfig({ key, direction })

            const sortedGroups = [...groups].sort((a: any, b: any) => {
                if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
                if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
                return 0
            })
            setGroups(sortedGroups)
        }
    }

    const getSortIndicator = (column: string) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? '↑' : '↓'
        }
        return ''
    }

    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform groups {groups?.length ? `(${formatWithCommas(groups.length)})` : ''}</h1>

                <Dialog>
                    <DialogTrigger>
                        <Button className='bg-blue-500 text-white'>
                            Add new group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-white'>
                        <DialogTitle>
                            Create a new group
                        </DialogTitle>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className='flex flex-col gap-3'>
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
                                                <FormMessage className='p-2 text-red-500' />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='group_state'

                                        render={({ field }) => (
                                            <FormItem className="">
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
                                                <FormMessage className='p-2 text-red-500' />
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
                                                <FormMessage className='p-2 text-red-500' />
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
                                                <FormMessage className='p-2 text-red-500' />
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
                                                <FormMessage className='p-2 text-red-500' />
                                            </FormItem>
                                        )}
                                    />
                                </div>


                                <div className='flex items-center gap-2 mt-3'>
                                    <Button type='submit' className='w-full bg-blue-500 text-slate-50'>
                                        Confirm
                                    </Button>
                                    <DialogClose className='w-full bg-transparent text-orange-500 border border-orange-500 '>
                                        <Button type='button'>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('group_name')}>
                                Name {getSortIndicator('group_name')}
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('createdAt')}>
                                Created at {getSortIndicator('createdAt')}
                            </TableHead>
                            <TableHead className='cursor-pointer w-auto'>
                                Total members
                            </TableHead>
                            <TableHead className='cursor-pointer'>Created by</TableHead>
                            <TableHead className='cursor-pointer'>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform groups</TableCaption>
                        <TableBody>
                            {
                                groups?.map((group, index) => {

                                    return (
                                        <TableRow key={group._id}>
                                            <TableCell>{group.group_name}</TableCell>
                                            <TableCell>{moment(group.createdAt).format('DD/MM/yyyy')}</TableCell>
                                            <TableCell>{group.members.length}</TableCell>
                                            <TableCell>{group?.created_by?.firstName} {group?.created_by?.lastName}</TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none">
                                                            Actions
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="origin-top-right absolute right-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-0">
                                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            onClick={() => {
                                                                setSelectedGroup(group)
                                                                router.push(`/manager_pages/groups/${group?._id}`)
                                                            }}
                                                        >Edit</button>
                                                        <Dialog>
                                                            <DialogTrigger className='w-full'>
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 rounded-md hover:bg-slate-100 ">
                                                                    {group?.suspended ? 'Unsuspend' : 'Suspend'}
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className='bg-white grid place-content-center w-auto'>
                                                                <DialogHeader className='w-full text-md font-bold'>
                                                                    Are you sure of this operation?
                                                                </DialogHeader>

                                                                <div>
                                                                    Confirm this action.
                                                                </div>

                                                                <div className='w-full flex gap-2'>
                                                                    <DialogClose>
                                                                        <Button
                                                                            onClick={async () => {
                                                                                const data = await handleGroupSuspension(group?._id)
                                                                                setGroups((prev: GroupTypes[]) => prev.map((prevGroup: GroupTypes) => prevGroup?._id === group._id ? { ...prevGroup, ...data } : prevGroup))
                                                                            }}
                                                                            className='text-white bg-red-500 '>
                                                                            Confirm
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <DialogClose>
                                                                        <Button className='bg-transparent text-orange-500 border border-orange-500'>
                                                                            Cancel
                                                                        </Button>
                                                                    </DialogClose>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Dialog>
                                                            <DialogTrigger className='w-full'>
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-white rounded-md hover:bg-red-300 bg-red-500">
                                                                    Delete
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className='bg-white grid place-content-center w-auto text-center'>
                                                                <DialogTitle>
                                                                    Confirm this operation
                                                                </DialogTitle>

                                                                <div>
                                                                    This cannot be undone.
                                                                </div>

                                                                <div className='w-full flex gap-2 justify-center'>
                                                                    <Button
                                                                        onClick={async () => {
                                                                            const res = await deleteGroup(group?._id)
                                                                            res && setGroups((prev: GroupTypes[]) => prev.filter(prevGroup => prevGroup._id !== group?._id))
                                                                        }}
                                                                        className='text-white bg-red-500 '>
                                                                        Confirm
                                                                    </Button>
                                                                    <DialogClose>
                                                                        <Button className='bg-transparent text-orange-500 border border-orange-500'>
                                                                            Cancel
                                                                        </Button>
                                                                    </DialogClose>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </PopoverContent>
                                                </Popover>

                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                )
                }
            </div>
        </div>
    )
}

export default page