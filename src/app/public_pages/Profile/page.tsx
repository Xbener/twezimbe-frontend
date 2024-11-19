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
      </section>
    )
  }
}

export default Profile