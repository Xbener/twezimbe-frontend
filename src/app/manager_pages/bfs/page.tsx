'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { deleteBf, getAllBfs } from '@/lib/bf'
import { BF } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import React, { use, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'
import Link from 'next/link'


type Props = {}

function page({ }: Props) {
    const { isLoading, bfs, setBfs } = useContext(AdminContext)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedBf, setSelectedBf] = useState<BF | null>(null)
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<BF>({
        defaultValues: selectedBf || {}
    });

    const handleDeleteBf = async (bfId: string) => {
        const res = await deleteBf(bfId)
        if (res) {
            setBfs((prev: BF[]) => prev.filter(bf => bf._id !== bfId))
        }
    }


    const onSubmit = async (data: BF) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/${selectedBf?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                },
                body: JSON.stringify({ ...data }),
            });
            const results = await res.json()
            if (!results.status) throw new Error(results.error || results.errors || results.message)
            toast.success(results.message)
            setBfs((prev: BF[]) => prev.map(prevBf => prevBf._id === selectedBf?._id ? { ...prevBf, ...results.bf } : prevBf))
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.Please try again")
        }
    };
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform bearevement funds {bfs?.length ? `(${formatWithCommas(bfs.length)})` : ''}</h1>
                <Link href={'/groups/bf?admin=true'}>
                    <Button className='bg-blue-500 text-white'>
                        Add new Breavement fund
                    </Button>
                </Link>
            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            <TableHead>No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Created at</TableHead>
                            <TableHead>Accumulated balance</TableHead>
                            <TableHead>Created by</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Parent group</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform Bereavement funds</TableCaption>
                        <TableBody>
                            {
                                bfs?.map((bf: BF, index) => {

                                    return (
                                        <TableRow key={bf._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{bf.fundName}</TableCell>
                                            <TableCell>{moment(bf.createdAt).format('DD/MM/yyyy')}</TableCell>
                                            <TableCell>{bf?.wallet?.balance ? formatWithCommas(bf?.wallet?.balance) : 0} UGX</TableCell>
                                            <TableCell>{bf?.createdBy?.firstName} {bf?.createdBy?.lastName}</TableCell>
                                            <TableCell>{bf.walletAddress}</TableCell>
                                            <TableCell>{bf.group?.name}</TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none">
                                                            Actions
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="origin-top-right absolute right-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
                                                        <Dialog>
                                                            <DialogTrigger>
                                                                <button
                                                                    onClick={() => setSelectedBf(bf)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Update</button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-white">
                                                                <DialogTitle>
                                                                    Update bereavement fund
                                                                </DialogTitle>

                                                                <form onSubmit={handleSubmit(onSubmit)} >
                                                                    <div className='flex flex-col gap-3'>
                                                                        <div>
                                                                            <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundName">
                                                                                Name of Fund
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                id="fundName"
                                                                                defaultValue={selectedBf?.fundName}
                                                                                {...register("fundName", { required: "Fund name is required" })}
                                                                                className={`w-full px-4 py-2 border ${errors.fundName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                                                                                placeholder="Enter fund name"
                                                                            />
                                                                            {errors.fundName && <p className="text-red-500 text-sm mt-1">{errors.fundName.message}</p>}
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundDetails">
                                                                                Fund Details
                                                                            </label>
                                                                            <textarea
                                                                                id="fundDetails"
                                                                                defaultValue={selectedBf?.fundDetails}
                                                                                {...register("fundDetails", { required: "Fund details are required" })}
                                                                                className={`w-full px-4 py-2 border ${errors.fundDetails ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                                                                                placeholder="Enter fund details"
                                                                                rows={4}
                                                                            />
                                                                            {errors.fundDetails && <p className="text-red-500 text-sm mt-1">{errors.fundDetails.message}</p>}
                                                                        </div>
                                                                    </div>

                                                                    <div className='w-full flex items-center gap-2 mt-2'>
                                                                        <DialogClose>
                                                                            <Button type="submit" className='bg-blue-500 text-slate-50'>
                                                                                Confirm
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <DialogClose>
                                                                            <Button type="button" className='bg-transparent text-orange-500 border border-orange-500'>
                                                                                Cancel
                                                                            </Button>
                                                                        </DialogClose>
                                                                    </div>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Dialog>
                                                            <DialogTrigger>
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-white rounded-md hover:bg-red-300 bg-red-500 ">
                                                                    Delete
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className='bg-white grid place-content-center w-auto text-center'>
                                                                <DialogTitle>
                                                                    Confirm this action
                                                                </DialogTitle>
                                                                This cannot be undone

                                                                <div className='w-full flex items-center gap-2 mt-2'>
                                                                    <DialogClose>
                                                                        <Button
                                                                            onClick={() => handleDeleteBf(bf._id!)}
                                                                            className='bg-red-500 text-slate-50'>

                                                                            Confirm
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <DialogClose>
                                                                        <Button className='bg-transparent border border-orange-500 text-orange-500'>
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