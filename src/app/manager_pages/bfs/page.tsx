import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BF } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import React from 'react'

type Props = {}

function page({ }: Props) {
    const { bfs, isLoading } = { bfs: [], isLoading: false }
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform bearevement funds {bfs?.length && `(${formatWithCommas(bfs.length)})`}</h1>
                <Button className='bg-blue-500 text-white'>
                    Add new Breavement fund
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
                            <TableHead>Wallet</TableHead>
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
                                            <TableCell>{bf?.members?.length}</TableCell>
                                            <TableCell>{bf?.createdBy?.firstName} {bf?.createdBy?.lastName}</TableCell>
                                            <TableCell>{bf.walletAddress}</TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none">
                                                            Actions
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="origin-top-right absolute right-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-0">
                                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</button>
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