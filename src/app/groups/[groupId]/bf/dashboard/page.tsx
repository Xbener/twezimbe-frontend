'use client'
import { useGetProfileData } from '@/api/auth'
import AreaChartComponent from '@/components/charts/AreaChart'
import { PieChartComponent } from '@/components/charts/PieChart'
import GroupMemberItem from '@/components/groups/GroupMemberItem'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { countryCodes } from '@/constants'
import { GroupContext } from '@/context/GroupContext'
import { fileCase, getCases, updateCase } from '@/lib/bf'
import { Case, Wallet } from '@/types'
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/export'
import { makePayment } from '@/utils/makePayment'
import { ArrowUpAz, Download, LucideOrigami, Settings } from 'lucide-react'
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
  const { currentUser } = useGetProfileData()
  let [metadata, setMetadata] = useState<MetaData[] | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [sortColumn, setSortColumn] = useState<any>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const userDepositsRef = useRef<any[]>([])
  const [payForm, setPayForm] = useState({
    open: false,
    data: {
      amount: "",
      phone: "",
      countryCode: countryCodes[0].code,
      type: ""
    }
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCase, setNewCase] = useState({
    name: '',
    description: '',
    principalId: currentUser?._id
  })
  const [isLoading, setIsLoading] = useState(false)
  const memberFilters = ['All', 'Admins', 'Principals']
  const processWalletData = () => {
    const userAmountMap: { [key: string]: number } = {};

    groupBF?.wallet?.transactionHistory.forEach((transaction) => {
      if (transaction.amount) {
        // Ensure the amount is treated as a number
        const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;

        // Create a unique key for the user using first and last name
        const userName = `${transaction.user.firstName} ${transaction.user.lastName}`;

        // Group amounts by user and sum them
        if (userAmountMap[userName]) {
          userAmountMap[userName] += amount;
        } else {
          userAmountMap[userName] = amount;
        }
      }
    });

    // Convert the map to an array of UserAmount objects
    const userAmountArray = Object.keys(userAmountMap).map((name) => ({
      name,
      amount: userAmountMap[name],
    }));

    return userAmountArray;
  };



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
      },
      {
        title: "Total contributions",
        value: groupBF?.contributions?.length
      }
    ])

    userDepositsRef.current = processWalletData()
  }, [
    group,
    groupBF,
    cases
  ])

  if (!groupBF) return ('loading ...')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTransactions = [...(groupBF?.wallet?.transactionHistory || [])].sort((a: any, b: any) => {
    if (!sortColumn) return 0;

    let valueA, valueB;
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
    <div className='bg-white text-neutral-700'>
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

        <div className="flex p-2 w-full items-start justify-start">
          <div className='w-1/2 flex flex-col gap-3'>
            <h1 className='text-[1.2rem] font-bold mb-2 text-center'>Balance history</h1>
            <AreaChartComponent />
          </div>
          <div className='w-1/2 flex flex-col gap-3'>
            <h1 className='text-[1.2rem] font-bold mb-2 text-center'>Member deposits</h1>
            <PieChartComponent data={userDepositsRef.current} />
          </div>
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
              <div className="w-full flex items-center justify-between">
                <h1 className='text-[1.2rem] mb-4 p-2'>Available Cases</h1>
                <Dialog open={dialogOpen}>
                  {
                    (groupBF?.role && groupBF?.role?.includes('principal')) && (
                      <DialogTrigger>
                        <Button onClick={() => setDialogOpen(true)}
                          className="bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                        >
                          file a case
                        </Button>
                      </DialogTrigger>
                    )
                  }
                  <DialogContent
                    className="w-full bg-white"
                  >
                    <DialogHeader>
                      File a new case
                    </DialogHeader>
                    <div className="p-4 rounded-md shadow-md w-full">
                      <h3 className="text-xl font-bold text-white mb-4">File a New Case</h3>
                      <form>
                        {/* Name Input */}
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium ">Case Name</label>
                          <input
                            type="text"
                            id="name"
                            onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                            name="name"
                            className="mt-1 p-2 w-full border border-gray-700 rounded "
                            placeholder="Enter case name"
                            required
                          />
                        </div>

                        {/* Description Input */}
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium ">Description</label>
                          <textarea
                            id="description"
                            name="description"
                            className="mt-1 p-2 w-full border border-gray-700 rounded-md"
                            onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter case description"
                            rows={3}
                            required
                          ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-3 mt-3">

                          <button
                            disabled={isLoading}
                            onClick={async (e) => {
                              setIsLoading(true)
                              e.preventDefault()
                              const { status, case: returnedCase } = await fileCase(groupBF?._id!, newCase)
                              setIsLoading(false)
                              if (status) {
                                setCases(prev => [...prev, returnedCase])
                                setDialogOpen(false)
                              }
                            }}
                            type="submit"
                            className="w-full bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-2"
                          >
                            Submit Case
                          </button>

                          <button
                            className="w-full bg-transparent border text-orange-500 border-orange-500 text-orange font-semibold py-2 px-4 rounded mt-2"
                            onClick={() => setDialogOpen(false)}
                          >

                            cancel
                          </button>
                        </div>
                      </form>
                    </div>

                  </DialogContent>
                </Dialog>
              </div>
              <Table className="border max-h-[500px] overflow-scroll bg-white rounded-md">
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
                            <Dialog>
                              <DialogTrigger className="w-full">
                                <button
                                  onClick={() => setPayForm(prev => ({ ...prev, open: true, type: "contribution" }))}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">contribute</button>
                              </DialogTrigger>
                              <DialogContent className="bg-white">
                                <DialogHeader className='font-bold text-[1.2rem] text-neutral-700'>
                                  Contribute to {caseItem.name}
                                </DialogHeader>

                                <div className="flex flex-col gap-2 ">
                                  <Input
                                    className="text-black border-2 "
                                    type="text"
                                    name="amount"
                                    placeholder="Enter amount to deposit"
                                    value={payForm.data.amount}
                                    onChange={(e) => {
                                      const input = e.target.value;
                                      if (/^\d*$/.test(input)) { // Allows only digits
                                        setPayForm(prev => ({ ...prev, data: { ...prev.data, amount: input } }));
                                      }
                                    }}
                                  />

                                  <div className="w-full flex cursor-pointer border-2  rounded-md">
                                    <select
                                      className="text-black rounded-l-md pl-3"
                                      defaultValue={"+256"}
                                      value={payForm.data.countryCode}
                                      onChange={handleCountryCodeChange}
                                    >
                                      {countryCodes.map((country) => (
                                        <option key={country.code} value={country.code}>
                                          {country.label} ({country.code})
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      className="text-black p-2 rounded-r w-full"
                                      type="text"
                                      name="phone"
                                      maxLength={9}
                                      placeholder="Enter mobile phone number"
                                      value={payForm.data.phone}
                                      onChange={(e) => {
                                        const input = e.target.value;
                                        if (/^\d*$/.test(input)) { // Allows only digits
                                          setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: input } }));
                                        }
                                      }}
                                    />

                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      disabled={payForm.data.amount === "" || payForm.data.amount === "0" || payForm.data.phone === ""}
                                      onClick={() => makePayment({ ...payForm, type: "contribution" }, currentUser!, groupBF!, caseItem._id)}
                                      className="bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                                      >
                                      Confirm
                                    </Button>

                                    <DialogClose>
                                      <Button
                                        className="bg-transparent text-orange-500 border border-orange-500 ">
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </PopoverContent>
                        </Popover>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='w-full shadow-md mt-5 p-2'>
              <div className='w-full flex items-center justify-between'>
                <h1 className='text-[1.2rem] mb-4 p-2'>Latest transactions</h1>
                <Popover>
                  <PopoverTrigger className='flex items-center gap-3 border-blue-500 border p-2 rounded-md text-blue-500'>
                    <Download /> Export
                  </PopoverTrigger>
                  <PopoverContent className='bg-white w-auto'>
                    <Button
                      onClick={() => exportToPDF(groupBF?.wallet?.transactionHistory.map((transaction) => ({ ...transaction, user: `${transaction.user.lastName} ${transaction.user.firstName}` }))!, `${groupBF?.fundName}_transaction_history.pdf`)}
                      className='w-full hover:bg-neutral-100'>
                      PDF
                    </Button>
                    <Button
                      onClick={() => exportToCSV(groupBF?.wallet?.transactionHistory.map((transaction) => ({ ...transaction, user: `${transaction.user.lastName} ${transaction.user.firstName}` }))!, `${groupBF?.fundName}_transaction_history.csv`)}
                      className='w-full hover:bg-neutral-100'>
                      CSV
                    </Button>
                    <Button
                      onClick={() => exportToExcel(groupBF?.wallet?.transactionHistory.map((transaction) => ({ ...transaction, user: `${transaction.user.lastName} ${transaction.user.firstName}` }))!, `${groupBF?.fundName}_transaction_history.xlsx`)}
                      className='w-full hover:bg-neutral-100'>
                      Excel
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
              <Table className='border max-h-[500px] overflow-scroll bg-white  rounded-md'>
                <TableCaption>Latest transactions</TableCaption>
                <TableHeader className='border-b text-neutral-700 font-bold' >
                  <TableHead onClick={() => handleSort('lastName')} className='cursor-pointer '>
                    <span className='flex items-center gap-3 '>Billing name {sortColumn === 'lastName' ? (sortDirection === 'asc' ? '▲' : "") : <ArrowUpAz className='size-3' />}</span>
                  </TableHead>
                  <TableHead onClick={() => handleSort('amount')} className='cursor-pointer '>
                    <span className='flex items-center gap-3 '>Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                  </TableHead>
                  <TableHead onClick={() => handleSort('date')} className='cursor-pointer '>
                    <span className='flex items-center gap-3 '>Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                  </TableHead>

                  <TableHead className='cursor-pointer '>
                    Details
                  </TableHead>
                </TableHeader>
                <TableBody>
                  {
                    sortedTransactions?.map((transaction, index) => (
                      <TableRow className='cursor-pointer text-neutral-700 hover:bg-neutral-100'>
                        <TableCell>{transaction.user.lastName} {transaction.user.firstName}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{moment(transaction.date).format('MM/DD/YY')}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>

          <div className='w-[30%] h-auto shadow-md p-4 rounded-md flex flex-col gap-2 bg-neutral-100'>
            <h1 className="text-[1.3rem] text-center font-bold capitalize">{groupBF?.fundName}</h1>
            <p>Details: {groupBF?.fundDetails}</p>
            <p>Wallet: {groupBF?.walletAddress}</p>
            <Dialog>
              <DialogTrigger className="w-full">
                <Button
                  onClick={() => setPayForm(prev => ({ ...prev, open: true, type: "deposit" }))}
                  className="w-full bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Deposit funds
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader className='font-bold text-[1.2rem] text-neutral-700'>
                  Make a deposit to {groupBF?.fundName}
                </DialogHeader>

                <div className="flex flex-col gap-2 ">
                  <Input
                    className="text-black border-2 "
                    type="text"
                    name="amount"
                    placeholder="Enter amount to deposit"
                    value={payForm.data.amount}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d*$/.test(input)) { // Allows only digits
                        setPayForm(prev => ({ ...prev, data: { ...prev.data, amount: input } }));
                      }
                    }}
                  />

                  <div className="w-full flex cursor-pointer border-2  rounded-md">
                    <select
                      className="text-black rounded-l-md pl-3"
                      defaultValue={"+256"}
                      value={payForm.data.countryCode}
                      onChange={handleCountryCodeChange}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label} ({country.code})
                        </option>
                      ))}
                    </select>
                    <input
                      className="text-black p-2 rounded-r w-full"
                      type="text"
                      name="phone"
                      maxLength={9}
                      placeholder="Enter mobile phone number"
                      value={payForm.data.phone}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (/^\d*$/.test(input)) { // Allows only digits
                          setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: input } }));
                        }
                      }}
                    />

                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      disabled={payForm.data.amount === "" || payForm.data.amount === "0" || payForm.data.phone === ""}
                      onClick={() => makePayment(payForm, currentUser!, groupBF!)}
                      className="bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                    >
                      Confirm
                    </Button>

                    <DialogClose>
                      <Button
                        className="bg-transparent text-orange-500 border border-orange-500 ">
                        Cancel
                      </Button>
                    </DialogClose>

                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page