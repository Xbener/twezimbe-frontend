'use client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { Transaction } from '@/types'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowUpAz } from 'lucide-react'
import { indexOf } from 'lodash'

type Props = {}

function page({ }: Props) {
    const { transactions, setTransactions, isLoading } = useContext(AdminContext)
    const [sortColumn, setSortColumn] = useState<any>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/${transactionId}`,
                {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('access-token')}`
                    }
                }

            )
            const data = await res.json()
            if (!data.status) throw new Error("Failed. Please try again")
            toast.success("Transaction removed successfully")
            setTransactions((prev: Transaction[]) => prev.filter(transaction => transaction._id !== transactionId))
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedTransactions = [...(transactions || [])].sort((a: any, b: any) => {
        if (!sortColumn) return 0;

        let valueA, valueB;
        if (sortColumn === 'no') {
            valueA = a.index
            valueB = b.index
        }
        if (sortColumn === 'date') {
            valueA = new Date(a.date).getTime(); // Convert to timestamp
            valueB = new Date(b.date).getTime();
        } else if (sortColumn === 'amount') {
            valueA = a[sortColumn];
            valueB = b[sortColumn];
        } else {
            valueA = a.user[sortColumn];
            valueB = b.user[sortColumn];
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });


    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform transactions {transactions?.length ? `(${formatWithCommas(transactions.length)})` : ''}</h1>

            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            {/* <TableHead className='cursor-pointer' onClick={() => handleSort('no')}>
                                <span className='flex items-center gap-3 '>No {sortColumn === 'no' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                            </TableHead> */}
                            <TableHead className='cursor-pointer'>Receiving wallet</TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('amount')}>
                                <span className='flex items-center gap-3 '>Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                            </TableHead>
                            <TableHead className='cursor-pointer'>Currency</TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('date')}>
                                <span className='flex items-center gap-3 '>Done at {sortColumn === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('lastName')}>
                                <span className='flex items-center gap-3 '>Done by {sortColumn === 'lastName' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                            </TableHead>
                            <TableHead className='cursor-pointer'>Type</TableHead>
                            <TableHead className='cursor-pointer'>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform transactions</TableCaption>
                        <TableBody>
                            {
                                sortedTransactions?.map((transaction, index) => {

                                    return (
                                        <TableRow key={transaction._id}>
                                            {/* <TableCell>{index + 1}</TableCell> */}
                                            <TableCell>{transaction.wallet}</TableCell>
                                            <TableCell>{formatWithCommas(transaction.amount)}</TableCell>
                                            <TableCell>UGX</TableCell>
                                            <TableCell>{moment(transaction.createdAt).format('DD/MM/yyyy')}</TableCell>
                                            <TableCell>{transaction.user?.firstName} {transaction.user?.lastName}</TableCell>
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger className=''>
                                                        <Button className='bg-red-500 text-slate-50'>
                                                            Delete
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className='bg-white w-auto grid place-content-center text-center'>
                                                        <DialogTitle>
                                                            Confirm this action
                                                        </DialogTitle>

                                                       <p>This cannot be undone</p>

                                                        <div className='w-full flex items-center gap-2 mt-2 justify-center'>
                                                            <DialogClose>
                                                                <Button
                                                                    onClick={() => handleDeleteTransaction(transaction._id!)}
                                                                    className="bg-red-500 text-slate-50">
                                                                    Confirm
                                                                </Button>
                                                            </DialogClose>
                                                            <DialogClose>
                                                                <Button className='bg-transparent border border-orange-500 text-orange-500'>Cancel</Button>
                                                            </DialogClose>
                                                        </div>
                                                    </DialogContent>

                                                </Dialog>
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