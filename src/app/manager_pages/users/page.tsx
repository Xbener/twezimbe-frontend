'use client'
import { useDeleteAccount, useGetAllUsers } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

type Props = {}

function page({ }: Props) {

    const { isLoading, users: allUsers, setSelectedUser } = useContext(AdminContext)
    const router = useRouter()
    const { deleteAccount, isLoading: deleteLoading } = useDeleteAccount()

    const handleDelete = async (userId: string) => {
        const res = await deleteAccount(userId)

    }
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform users {allUsers?.length ? `(${formatWithCommas(allUsers.length)})` : ''}</h1>
                <Dialog>
                    <DialogTrigger>
                        <Button className='bg-blue-500 text-white'>
                            Add new user
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-white w-auto text-neutral-600'>
                        <DialogHeader className='font-bold'>
                            Add a new user to the platform
                        </DialogHeader>

                        <div className="w-full flex flex-col space-y-4">
                            {/* First Name */}
                            <div className="flex flex-col">
                                <label htmlFor="firstName" className="mb-1">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter First Name"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col">
                                <label htmlFor="lastName" className="mb-1">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter Last Name"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label htmlFor="email" className="mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter Email"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col">
                                <label htmlFor="password" className="mb-1">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter Password"
                                />
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col">
                                <label htmlFor="phone" className="mb-1">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter Phone Number"
                                />
                            </div>

                            <div className='w-full flex items-center'>
                                <Button className='bg-blue-500 text-slate-50'>
                                    Create account
                                </Button>
                                <DialogClose>
                                    <Button className="bg-transparent border border-blue-500 text-blue-500">
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>

                    </DialogContent>
                </Dialog>
            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            <TableHead>No</TableHead>
                            <TableHead>First name</TableHead>
                            <TableHead>Last name</TableHead>
                            <TableHead>Joined at</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform users</TableCaption>
                        <TableBody>
                            {
                                allUsers?.map((user, index) => {

                                    return (
                                        <TableRow key={user._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{moment(user.createdAt).format('DD/MM/yyyy')}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none">
                                                            Actions
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="origin-top-right absolute right-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-0">
                                                        {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</button> */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                router.push(`/manager_pages/users/${user.id}`)
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                                                        <Dialog>
                                                            <DialogTrigger>
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-white rounded-md hover:bg-red-300 bg-red-500">
                                                                    Delete
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className='bg-white'>
                                                                <DialogHeader className='w-full text-md font-bold'>
                                                                    Are you sure of this operation?
                                                                </DialogHeader>

                                                                <div>
                                                                    Confirm this action.
                                                                </div>

                                                                <div className='w-full flex gap-2'>
                                                                    <Button
                                                                        onClick={async () => {
                                                                            await handleDelete(user._id! || user?.id)
                                                                            window.location.reload()
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