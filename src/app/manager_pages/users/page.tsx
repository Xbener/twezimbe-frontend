'use client'
import { handleSuspension, useDeleteAccount, useGetAllUsers } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { User } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import React, { ReactEventHandler, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {}

function page({ }: Props) {

    const { isLoading, users, setUsers, setSelectedUser, currentUser } = useContext(AdminContext)
    const router = useRouter()
    const { deleteAccount, isLoading: deleteLoading } = useDeleteAccount()
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' })


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/signup`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify(formData)
                }
            )

            const data = await res.json()
            if (!res.ok) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
            toast.success(data.message)
            setUsers((prev: User[]) => [...prev, data.user])
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
    };


    const handleDelete = async (userId: string) => {
        const res = await deleteAccount(userId)
        setUsers((prev: User[]) => prev.filter(user => (user._id === userId || user.id === userId)))
    }

    const handleSort = (key: string) => {
        if (users) {
            let direction = 'asc'
            if (sortConfig.key === key && sortConfig.direction === 'asc') {
                direction = 'desc'
            }
            setSortConfig({ key, direction })

            const sortedUsers = [...users].sort((a: any, b: any) => {
                if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
                if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
                return 0
            })
            setUsers(sortedUsers)
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
                <h1 className='text-lg text-neutral-700 font-bold'>Platform users {users?.length ? `(${formatWithCommas(users.length)})` : ''}</h1>
                <Dialog>
                    <DialogTrigger>
                        <Button className='bg-blue-500 text-white'>
                            Add new user
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-white w-auto text-neutral-600'>
                        <DialogTitle>Add a new user to the platform</DialogTitle>
                        <div className="w-full flex flex-col space-y-4">
                            {/* First Name */}
                            <div className="flex flex-col">
                                <label htmlFor="firstName" className="mb-1">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
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
                                    value={formData.lastName}
                                    onChange={handleChange}
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
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    value={formData.password}
                                    onChange={handleChange}
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
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="p-2 rounded-md bg-transparent border"
                                    placeholder="Enter Phone Number"
                                />
                            </div>

                            <div className='w-full flex items-center gap-2'>
                                <DialogClose>
                                    <Button
                                        onClick={handleSubmit}
                                        className='bg-blue-500 text-slate-50'>
                                        Create account
                                    </Button>
                                </DialogClose>
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

                            <TableHead className='cursor-pointer' onClick={() => handleSort('firstName')}>
                                First name {getSortIndicator('firstName')}
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('lastName')}>
                                Last name {getSortIndicator('lastName')}
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('createdAt')}>
                                Joined at {getSortIndicator('createdAt')}
                            </TableHead>
                            <TableHead>
                                Wallet
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('role')}>
                                Role {getSortIndicator('role')}
                            </TableHead>
                            <TableHead className='cursor-pointer'>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform users</TableCaption>
                        <TableBody>
                            {
                                users?.map((user, index) => {

                                    return (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{moment(user.createdAt).format('DD/MM/yyyy')}</TableCell>
                                            <TableCell>{user.wallet?.walletAddress}</TableCell>
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
                                                                router.push(`/manager_pages/users/${user._id}`)
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                                                        <Dialog>
                                                            <DialogTrigger className='w-full'>
                                                                <button
                                                                    disabled={currentUser?._id === user.id}
                                                                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 rounded-md hover:bg-slate-100 ">
                                                                    {user.suspended ? 'Unsuspend' : 'Suspend'}
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
                                                                                const data = await handleSuspension(user._id! || user?.id)
                                                                                setUsers((prev: User[]) => prev.map(prevUser => (prevUser?._id === user._id || prevUser?._id === user.id) ? { ...prevUser, ...data } : prevUser))
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
                                                                    disabled={currentUser?._id === user.id}
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
                                                                            await handleDelete(user._id! || user?.id)
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