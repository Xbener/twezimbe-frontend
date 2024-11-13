'use client'
import { deleteQuestion, updateQuestion } from '@/api/inquries'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { AdminContext } from '@/context/AdminContext'
import { SystemMessage } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import { DialogClose } from '@radix-ui/react-dialog'
import moment from 'moment'
import React, { useContext, useState } from 'react'

type Props = {}

function page({ }: Props) {
    const { messages, setMessages } = useContext(AdminContext)
    const [response, setResponse] = useState("")
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>System messages {messages?.length ? `(${formatWithCommas(messages.length)})` : ''}</h1>
            </div>

            <div className='w-full mt-5'>
                <Table className='bg-white'>
                    <TableHeader>
                        <TableHead >Sent by</TableHead>
                        <TableHead >email</TableHead>
                        <TableHead >responded</TableHead>
                        <TableHead >Sent on</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                    </TableHeader>
                    <TableCaption>All twezimbe system messages</TableCaption>
                    <TableBody>
                        {
                            messages?.map((message: SystemMessage, index) => {

                                return (
                                    <TableRow key={message._id}>
                                        <TableCell>{message.fullName}</TableCell>
                                        <TableCell>{message.email}</TableCell>
                                        <TableCell>{message.responded ? "Yes" : "No"}</TableCell>
                                        <TableCell>{moment(message?.createdAt).format('DD/MM/yyyy')}</TableCell>
                                        <TableCell className='flex gap-1 justify-center'>
                                            <Dialog>
                                                <DialogTrigger>
                                                    <Button className='bg-blue-500 text-white'>
                                                        Answer
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className='bg-white'>
                                                    <DialogTitle>
                                                        Answer {message.fullName}
                                                    </DialogTitle>
                                                    <div className='flex flex-col p-2'>
                                                        <Textarea
                                                            className='w-full'
                                                            name='response'
                                                            onChange={(e) => setResponse(e.target.value)}
                                                            value={response}
                                                            required
                                                            id='response'
                                                            placeholder='Provide your response here ...'
                                                        />
                                                    </div>

                                                    <div className='w-full flex mt-5 gap-2'>
                                                        <DialogClose>
                                                            <Button
                                                                onClick={async () => {
                                                                    const res = await updateQuestion(message._id!, response)
                                                                    if (res.status) {
                                                                        setMessages((prev: SystemMessage[]) => prev.map(msg => msg._id === message._id ? { ...res.question } : msg))
                                                                    }
                                                                }}
                                                                className='bg-blue-500 text-white'>
                                                                Answer
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
                                            <Dialog>
                                                <DialogTrigger >
                                                    <Button className='bg-transparent border border-blue-500 text-blue-500'>
                                                        view
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className='bg-white'>
                                                    <DialogTitle>
                                                        {message.fullName}&apos; message
                                                    </DialogTitle>
                                                    <div className='w-auto p-2'>
                                                        <p>{message.email}</p>
                                                        <div className='mt-2 mb-2 p-2 ml-5'>
                                                            <p>
                                                                <i>
                                                                    {message?.message}
                                                                </i>
                                                            </p>
                                                            <p> ===============================</p>
                                                            <p> {message.response}</p>
                                                        </div>
                                                        <p>{moment(message.createdAt).format("DD/MM/YYYY")}</p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Dialog>
                                                <DialogTrigger>
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-sm text-white rounded-md hover:bg-red-300 bg-red-500 ">
                                                        Delete
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className='bg-white grid place-content-center w-auto'>
                                                    <DialogTitle>
                                                        Confirm this action
                                                    </DialogTitle>
                                                    This cannot be undone

                                                    <div className='w-full flex items-center gap-2 mt-2'>
                                                        <DialogClose>
                                                            <Button
                                                                onClick={async () => {
                                                                    const res = await deleteQuestion(message._id!)
                                                                    if (res) {
                                                                        setMessages((prev: SystemMessage[]) => prev.filter(msg => msg._id !== message._id))
                                                                    }
                                                                }}
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
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default page