'use client'
import { useGetAllGroups } from '@/api/group'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

type Props = {}

function page({ }: Props) {
    const { isLoading, groups, setSelectedGroup } = useContext(AdminContext)
    const router = useRouter()
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform groups {groups?.length ? `(${formatWithCommas(groups.length)})` : ''}</h1>
                <Button className='bg-blue-500 text-white'>
                    Add new group
                </Button>
            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            <TableHead>No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Created at</TableHead>
                            <TableHead>Total members</TableHead>
                            <TableHead>Created by</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform groups</TableCaption>
                        <TableBody>
                            {
                                groups?.map((group, index) => {

                                    return (
                                        <TableRow key={group._id}>
                                            <TableCell>{index + 1}</TableCell>
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
                                                        onClick={()=>{
                                                            setSelectedGroup(group)
                                                            router.push(`/manager_pages/groups/${group?._id}`)
                                                        }}
                                                        >Edit</button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-white rounded-md hover:bg-red-300 bg-red-500">
                                                            Delete
                                                        </button>
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