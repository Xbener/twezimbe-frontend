"use client"
import { useGetProfileData, useUpdateUserAccount } from "@/api/auth";
import UserProfileForm from "@/components/forms/UserProfileForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { countryCodes } from "@/constants";
import { User } from "@/types";
import { formatWithCommas } from "@/utils/formatNumber";
import { makePayment } from "@/utils/makePayment";
import { ArrowUpAz } from "lucide-react";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { Store } from "@/context/user";
// import { useContext } from "react";

const Profile = () => {
  // const userContext = useContext(Store);
  const { updateAccount, isLoading } = useUpdateUserAccount();
  const { currentUser } = useGetProfileData();
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [sortColumn, setSortColumn] = useState<any>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isEditing, setIsEditing] = useState(false)
  const [payForm, setPayForm] = useState({
    open: false,
    data: {
      amount: "",
      phone: currentUser?.phone,
      countryCode: countryCodes[0].value,
      type: ""
    }
  })
  useEffect(() => {
    setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: currentUser?.phone } }))
  }, [currentUser])
  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setPayForm(prev => ({ ...prev, data: { ...prev.data, countryCode } }));
  };

  useEffect(() => {
    if (!searchParams.get("id") && currentUser) {
      setUser(currentUser)
    }
  }, [searchParams, currentUser])
  useEffect(() => {
    const getUserToUpdate = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/user-to-update/${searchParams.get('id')}`,
          {
            method: 'GET',
          }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.message || data.errors)
        setUser({ ...data.user, _id: searchParams.get('id') })
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong. Please try again")
      }
    }

    if (searchParams.get('id')) [
      getUserToUpdate()
    ]
  }, [searchParams])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTransactions = [...(user?.wallet?.transactionHistory || [])].sort((a: any, b: any) => {
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
  if (user) {
    return (
      <section className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-4 p-5 md:p-0 w-full items-start">
          <h2 className='text-2xl font-bold'>Profile</h2>
          {
            isEditing ? (
              <>
                <Button className="text-blue-500 bg-transparent border border-blue-500" onClick={() => setIsEditing(prev => !prev)}>Cancel</Button>
                <UserProfileForm
                  currentUser={user}
                  onSave={(data) => {
                    updateAccount(data)
                    // window.location.reload();
                  }
                  }
                  isLoading={isLoading}
                />
              </>
            ) : (
              <>
                <Button className="bg-blue-500 text-white" onClick={() => setIsEditing(prev => !prev)}>Edit profile</Button>
              </>
            )
          }
        </div>
        <div className="w-[100&] flex flex-col gap-4 md:p-0 p-2 text-neutral-700  items-start justify-start">
          <h2 className="text-2xl font-bold">Wallet</h2>
          <div className="w-full flex justify-between p-3 border rounded-md">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-extrabold">Balance</h2>
              <p>{user.wallet?.balance && formatWithCommas(user.wallet?.balance)} UGX</p>
            </div>

            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger className="w-full">
                  <Button
                    onClick={() => setPayForm(prev => ({ ...prev, open: true, type: "deposit" }))}
                    className="bg-neutral-100 border-neutral-800 cursor-pointer hover:bg-neutral-200"
                  >
                    Deposit funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogTitle>
                    Make a deposit to personal wallet
                  </DialogTitle>

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
                          <option key={country.code} value={country.value}>
                            {country.label} ({country.code})
                          </option>
                        ))}
                      </select>
                      <input
                        className="text-black p-2 rounded-r w-full"
                        type="text"
                        name="phone"
                        maxLength={10}
                        placeholder="Enter mobile phone number"
                        // value={payForm.data.phone}
                        defaultValue={user.phone}
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
                        disabled={payForm.data.amount === "" || payForm.data.amount === "0"}
                        onClick={() => makePayment(payForm, currentUser!, user.wallet?.walletAddress!)}
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
              {/* <Button className="bg-neutral-100 border-neutral-800 cursor-pointer hover:bg-neutral-200">
                Withdraw
              </Button> */}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <h2 className="text-xl font-bold">Transaction history</h2>

            <Table className='border max-h-[500px] overflow-scroll bg-white  rounded-md'>
              <TableCaption>Transaction history</TableCaption>
              <TableHeader className='border-b text-neutral-700 font-bold' >
                <TableHead onClick={() => handleSort('lastName')} className='cursor-pointer '>
                  <span className='flex items-center gap-3 '>Billing name {sortColumn === 'lastName' ? (sortDirection === 'asc' ? '▲' : "▼") : <ArrowUpAz className='size-3' />}</span>
                </TableHead>
                <TableHead onClick={() => handleSort('amount')} className='cursor-pointer w-auto'>
                  <span className='flex items-center gap-3 '>Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                </TableHead>
                <TableHead onClick={() => handleSort('date')} className='cursor-pointer '>
                  <span className='flex items-center gap-3 '>Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : <ArrowUpAz className='size-3' />}</span>
                </TableHead>

                <TableHead className='cursor-pointer '>
                  Type
                </TableHead>
                <TableHead className='cursor-pointer '>
                  Wallet
                </TableHead>
              </TableHeader>
              <TableBody>
                {
                  sortedTransactions?.map((transaction, index) => (
                    <TableRow className='cursor-pointer text-neutral-700 hover:bg-neutral-100'>
                      <TableCell>{user?.lastName} {user?.firstName}</TableCell>
                      <TableCell>{formatWithCommas(transaction.amount)}</TableCell>
                      <TableCell>{moment(transaction.date).format('MM/DD/YY')}</TableCell>
                      <TableCell>
                        {transaction.type}
                      </TableCell>
                      <TableCell>{user.wallet?.walletAddress}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    )
  }
}

export default Profile