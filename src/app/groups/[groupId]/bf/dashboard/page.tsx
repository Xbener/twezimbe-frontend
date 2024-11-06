'use client'
import GroupMemberItem from '@/components/groups/GroupMemberItem'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { countryCodes } from '@/constants'
import { GroupContext } from '@/context/GroupContext'
import { getCases, updateCase } from '@/lib/bf'
import { Case } from '@/types'
import { LucideOrigami, Settings } from 'lucide-react'
import moment from 'moment'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { AiFillCaretDown } from 'react-icons/ai'
type Props = {}

interface MetaData {
  title: string
  value?: any
}

function page({ }: Props) {

  const { groupBF, group, bfMembers } = React.useContext(GroupContext)
  const router = useRouter()
  let [metadata, setMetadata] = useState<MetaData[] | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [payForm, setPayForm] = useState({
    open: false,
    data: {
      amount: "",
      phone: "",
      countryCode: countryCodes[0].code
    }
  })
  const memberFilters = ['All', 'Admins', 'Principals']

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setPayForm(prev => ({ ...prev, data: { ...prev.data, countryCode } }));
  };

  useEffect(() => {
    const getData = async () => {
      const { cases, status } = await getCases(groupBF?._id!)
      if (status) setCases(cases)
    }
    if (groupBF) {
      getData()
    }
  }, [])


  useEffect(() => {
    setMetadata([
      {
        title: "Total members",
        value: bfMembers?.length
      },
      {
        title: "Balance",
        value: `${groupBF?.wallet?.balance} UGX`
      },
      {
        title: "Total transactions",
        value: groupBF?.wallet?.transactionHistory.length
      },
      {
        title: "Total cases",
        value: cases.length
      }
    ])
  }, [
    group,
    groupBF,
    cases
  ])
  return (
    <div>
      <div className='w-full p-2 flex justify-between border-b'>
        <div className='flex items-center gap-2'>
          <LucideOrigami />
          <h1 className='text-[1.2rem] font-bold'>
            {groupBF?.fundName}
          </h1>
        </div>

        <div>
          <Button
            onClick={() => router.push(`/groups/${group?._id}/bf/settings`)}
          >
            <Settings />
          </Button>
        </div>
      </div>

      <div className="w-full p-3 mt-5 flex flex-col items-start gap-2">
        <div className='flex gap-2 w-full flex-wrap'>
          {
            metadata?.length ? metadata.map((card, index) => {
              return (
                <div
                  className={`flex-1 min-w-[200px] flex-col  max-w-[15%] border border-white p-4 rounded-lg shadow-md flex justify-around `}
                >
                  <div className="text-md font-semibold ">{card.title}</div>
                  <div className="text-[1.5rem] font-bold">{card.value}</div>
                </div>
              )
            }) : null
          }
        </div>

        <div className='w-full flex gap-4 items-start mt-5'>
          <div className=' mt-5 w-[70%] '>
            <div className='w-1/2'>
              <div className='shadow-md p-2'>
                <div className="flex w-full justify-between items-center">
                  <h1 className='text-[1.2rem] mb-4 p-2'>Members</h1>
                  <span className='flex items-center gap-2'>
                      All
                     <AiFillCaretDown />
                  </span>
                </div>
                {
                  bfMembers?.map((member) => {

                    return (
                      <GroupMemberItem {...member.user} />
                    )
                  })
                }
              </div>
              <div></div>
            </div>
              
            <div className='w-full shadow-md mt-5 p-2'>
              <h1 className='text-[1.2rem] mb-4 p-2'>Available Cases</h1>
              <Table className="border bg-white rounded-md">
                <TableCaption>Latest Cases</TableCaption>
                <TableHeader className="border-b text-neutral-700 font-bold">
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Principal</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Contribution Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem, index) => (
                    <TableRow key={caseItem._id} className="cursor-pointer text-neutral-700 hover:bg-neutral-100">
                      <TableCell>{caseItem.name}</TableCell>
                      {/* <TableCell>{caseItem.principal.lastName} {caseItem.principal.firstName}</TableCell> */}

                      {/* Status with conditional color */}
                      <TableCell className={caseItem.status === 'Open' ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                        {caseItem.status}
                      </TableCell>

                      {/* Contribution Status with conditional color */}
                      <TableCell className={caseItem.contributionStatus === 'Complete' ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                        {caseItem.contributionStatus}
                      </TableCell>

                      <TableCell>
                        {caseItem.description.length > 20
                          ? `${caseItem.description.slice(0, 20)}...`
                          : caseItem.description}
                      </TableCell>
                      <TableCell>{moment(caseItem.createdAt).format('MM/DD/YY')}</TableCell>

                      {/* Actions dropdown */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger>
                            <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none">
                              Actions
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="origin-top-right absolute right-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <Dialog>
                              <DialogTrigger className="w-full">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</button>
                              </DialogTrigger>
                              <DialogContent className="w-full bg-white p-6 overflow-scroll max-h-[600px] rounded-lg">
                                <DialogHeader className="text-xl font-bold mb-4">Case Details</DialogHeader>
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-semibold">Name:</span> {caseItem.name}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-semibold">Created by:</span> {caseItem.principal.firstName} {caseItem.principal.lastName}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-semibold">Description:</span> {caseItem.description}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-semibold">Filed on:</span> {moment(caseItem.createdAt).format('LL')}
                                </p>
                                <div className="flex items-center gap-4 mt-4">
                                  <Button
                                    onClick={async () => {
                                      const { status, case: updatedCase } = await updateCase(caseItem._id, { status: caseItem.status === 'Open' ? 'Closed' : 'Open' })
                                      if (status) {
                                        setCases(prev => prev.map(prevCase => prevCase?._id === caseItem?._id ? { ...updatedCase, status: caseItem.status === 'Open' ? 'Closed' : 'Open' } : { ...caseItem }))
                                      }
                                    }}
                                    className={`text-white px-4 py-2 rounded ${caseItem.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`}>
                                    Mark as {caseItem.status === 'Open' ? 'Closed' : 'Open'}
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      const { status, case: updatedCase } = await updateCase(caseItem._id, { contributionStatus: caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete' })
                                      if (status) {
                                        setCases(prev => prev.map(prevCase => prevCase?._id === caseItem?._id ? { ...updatedCase, contributionStatus: caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete' } : { ...caseItem }))
                                      }
                                    }}
                                    className={`text-white px-4 py-2 rounded ${caseItem.contributionStatus === 'Complete' ? 'bg-red-500' : 'bg-green-500'}`}>
                                    Mark Contribution {caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete'}
                                  </Button>
                                </div>
                                <DialogClose>
                                  <Button className="mt-6 bg-gray-500 text-white px-4 py-2 rounded w-full">
                                    Close
                                  </Button>
                                </DialogClose>
                              </DialogContent>
                            </Dialog>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">contribute</button>
                          </PopoverContent>
                        </Popover>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='w-full shadow-md mt-5 p-2'>
              <h1 className='text-[1.2rem] mb-4 p-2'>Latest transactions</h1>
              <Table className='border bg-white  rounded-md'>
                <TableCaption>Latest transactions</TableCaption>
                <TableHeader className='border-b text-neutral-700 font-bold' >
                  <TableHead>Billing name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableHeader>
                <TableBody>
                  {
                    groupBF?.wallet?.transactionHistory?.map((transaction, index) => (
                      <TableRow className='cursor-pointer text-neutral-700 hover:bg-neutral-100'>
                        <TableCell>{transaction.user.lastName} {transaction.user.firstName}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{moment(transaction.date).format('MM DD YY, HH:mm')}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>

          <div className='w-[30%] h-auto shadow-md p-4 rounded-md flex flex-col gap-2 bg-[rgba(29,68,117,0.33)]'>
            <h1 className="text-[1.3rem] text-center font-bold capitalize">{groupBF?.fundName}</h1>
            <p>Details: {groupBF?.fundDetails}</p>
            <p>Wallet: {groupBF?.walletAddress}</p>
            <Button
              onClick={() => setPayForm(prev => ({ ...prev, open: true }))}
              className="bg-blue-500 ">
              Deposit funds
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page