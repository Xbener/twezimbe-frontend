"use client"
import { useGetProfileData, useUpdateUserAccount } from "@/api/auth";
import UserProfileForm from "@/components/forms/UserProfileForm";
import { User } from "@/types";
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

  if (user) {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 p-5 md:p-0">
          <h2 className='text-2xl font-bold'>Profile</h2>
          <UserProfileForm
            currentUser={user}
            onSave={(data) => {
              updateAccount(data)
              // window.location.reload();
            }
            }
            isLoading={isLoading}
          />
        </div>
      </section>
    )
  }
}

export default Profile