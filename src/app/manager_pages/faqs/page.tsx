'use client'
import { createFaq, deleteFaq, updateFaq } from '@/api/inquries'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { AdminContext } from '@/context/AdminContext'
import { FAQ } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import React, { useContext, useState } from 'react'

type Props = {}

function page({ }: Props) {
    const { faqs, setFaqs } = useContext(AdminContext)
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null)
    const [newFaq, setNewFaq] = useState({
        question: "",
        answer: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSelectedFaq(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setNewFaq(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    return (
        <div className='w-full  text-neutral-700'>
            <div className='w-full flex items-center justify-between p-2'>
                <h1 className='text-lg text-neutral-700 font-bold'>FAQs {faqs?.length ? `(${formatWithCommas(faqs.length)})` : ''}</h1>
                <Dialog>
                    <DialogTrigger>
                        <Button className='bg-blue-500 text-white'>
                            Add new FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-white flex flex-col'>
                        <DialogTitle>
                            Add new FAQ
                        </DialogTitle>
                        <div className='min-w-full mt-3 flex gap-2 flex-col'>
                            <Input
                                name="question"
                                id="question"
                                placeholder='Question'
                                defaultValue={newFaq?.question}
                                value={newFaq?.question}
                                onChange={handleChange}
                            />
                            <Textarea
                                name="answer"
                                id="answer"
                                placeholder='Answer'
                                defaultValue={newFaq?.answer}
                                value={newFaq?.answer}
                                onChange={handleChange}
                            />
                            <div className='w-full flex mt-3 items-center gap-2 justify-center'>
                                <DialogClose>
                                    <Button
                                        onClick={async () => {
                                            const res = await createFaq(newFaq)
                                            if (res.status) {
                                                setFaqs((prev: FAQ[]) => [...prev, { ...res.faq }])
                                            }
                                        }}
                                        className='bg-blue-500 text-white'>
                                        Create
                                    </Button>
                                </DialogClose>
                                <DialogClose>
                                    <Button className='bg-transparent border-orange-500 text-orange-500 border'>
                                        Close
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className='w-full mt-5'>
                <Table className='bg-white md:w-full w-[1248px]'>
                    <TableHeader>
                        <TableHead >Question</TableHead>
                        <TableHead >Answer</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                    </TableHeader>
                    <TableCaption>Frequently asked question</TableCaption>
                    <TableBody>
                        {
                            faqs?.map((faq: FAQ, index) => {

                                return (
                                    <TableRow key={faq._id}>
                                        <TableCell>{faq.question}</TableCell>
                                        <TableCell>{faq.answer}</TableCell>
                                        <TableCell className='flex gap-1 justify-center'>
                                            <Dialog>
                                                <DialogTrigger >
                                                    <Button onClick={() => setSelectedFaq(faq)} className='bg-transparent border border-blue-500 text-blue-500'>
                                                        Update
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className='bg-white'>
                                                    <DialogTitle>
                                                        Update FAQ
                                                    </DialogTitle>
                                                    <div className='w-auto p-2 gap-2 flex flex-col'>
                                                        <Input
                                                            name="question"
                                                            id="question"
                                                            placeholder='Question'
                                                            defaultValue={selectedFaq?.question}
                                                            value={selectedFaq?.question}
                                                            onChange={handleChange}
                                                        />
                                                        <Textarea
                                                            name="answer"
                                                            id="answer"
                                                            placeholder='Answer'
                                                            defaultValue={selectedFaq?.answer}
                                                            value={selectedFaq?.answer}
                                                            onChange={handleChange}
                                                        />

                                                        <div className='min-w-full mt-3 flex gap-2 justify-center'>
                                                            <DialogClose>
                                                                <Button
                                                                    onClick={async () => {
                                                                        if (selectedFaq) {
                                                                            const res = await updateFaq(faq._id!, selectedFaq)
                                                                            if (res.status) {
                                                                                setFaqs((prev: FAQ[]) => prev.map(prevFaq => prevFaq._id === selectedFaq._id ? { ...res.faq } : prevFaq))
                                                                            }
                                                                        }
                                                                    }}
                                                                    className='bg-blue-500 text-white'>
                                                                    Update
                                                                </Button>
                                                            </DialogClose>
                                                            <DialogClose>
                                                                <Button className='bg-transparent border-orange-500 text-orange-500 border'>
                                                                    Close
                                                                </Button>
                                                            </DialogClose>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Dialog>
                                                <DialogTrigger>
                                                    <Button className="bg-transparent border-red-500 text-red-500 border">
                                                        Delete
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="grid place-self-center text-center bg-white w-auto">
                                                    <DialogTitle>
                                                        Confirm this action
                                                    </DialogTitle>
                                                    <p>This cannot be undone.</p>

                                                    <div className='w-full flex items-center gap-2 mt-2 justify-center'>
                                                        <DialogClose>
                                                            <Button
                                                                onClick={async () => {
                                                                    const res = await deleteFaq(faq._id!)
                                                                    if (res) {
                                                                        setFaqs((prev: FAQ[]) => prev.filter(msg => msg._id !== faq._id))
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