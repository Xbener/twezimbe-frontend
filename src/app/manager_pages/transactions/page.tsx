'use client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminContext } from '@/context/AdminContext'
import { formatWithCommas } from '@/utils/formatNumber'
import moment from 'moment'
import React, { useContext } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { Transaction } from '@/types'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Props = {}

function page({ }: Props) {
    const { transactions, setTransactions, isLoading } = useContext(AdminContext)
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
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>Platform transactions {transactions?.length ? `(${formatWithCommas(transactions.length)})` : ''}</h1>

            </div>

            <div className='flex flex-col gap-3 mt-5'>
                {isLoading ? 'loading ...' : (
                    <Table className='bg-white'>
                        <TableHeader>
                            <TableHead>No</TableHead>
                            <TableHead>Receiving wallet</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Done at</TableHead>
                            <TableHead>Done by</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableCaption>All twezimbe platform transactions</TableCaption>
                        <TableBody>
                            {
                                transactions?.map((transaction, index) => {

                                    return (
                                        <TableRow key={transaction._id}>
                                            <TableCell>{index + 1}</TableCell>
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
                                                    <DialogContent className='bg-white'>
                                                        <DialogTitle>
                                                            Confirm this action
                                                        </DialogTitle>

                                                        Are you sure of this action? it cannot be undone.

                                                        <div className='w-full flex items-center gap-2 mt-2'>
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