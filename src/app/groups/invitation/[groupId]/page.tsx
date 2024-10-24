'use client'

import { useGetProfileData } from '@/api/auth'
import { useGetGroup, useJoinGroup } from '@/api/group'
import { Button } from '@/components/ui/button'
import { GroupTypes } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {}

function InvitationPage({ }: Props) {

    const { groupId } = useParams()
    const { getGroup, isError, isLoading, isSuccess } = useGetGroup()
    const [group, setGroup] = useState<GroupTypes | null>(null)
    const { currentUser } = useGetProfileData();
    const { joinGroup, isSuccess: joinSuccess, isLoading: joinLoading, isError: joinError } = useJoinGroup()
    const router = useRouter()
    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await getGroup(groupId as string)
                if (res.group._id !== null) {
                    setGroup(res.group)
                    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${res.group?._id}/room/${res.default_channel}`)
                }
            } catch (error) {
                toast.error("Error occurred. Please referesh the page.")
            }
        }

        fetchGroup()
    }, [groupId])

    const acceptInvitation = async () => {
        try {
            const res = await joinGroup({ user_id: currentUser?._id, group_id: group?._id })

            if (res._id !== null) {
                window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${group?._id}`
            }
        } catch (error) {
            toast.error("An error occurred. Please try again")
        }
    }
    return (
        <div className='w-full h-[100vh] border-2 grid place-content-center'>
            {
                isLoading || !group ? (
                    <div className='w-[50px] h-[50px] rounded-full border-t-2 border-l-2 animate-spin'></div>
                ) : (
                    <div className='text-center flex flex-col gap-5 items-center justify-center'>
                        <h1 className='text-[1.3rem]'> You were invited to join <span className=' capitalize font-bold'>{group?.group_name}</span></h1>
                        <div className='flex gap-3'>
                            <Button variant={'default'} onClick={() => acceptInvitation()} disabled={isLoading} className='bg-[#013a6fd8] text-white'>Accept</Button>
                            {/* <Button variant={'destructive'} className='border-red-500 text-red-500 border-2'>Decline</Button> */}
                        </div>
                    </div>
                )

            }
        </div>
    )
}

export default InvitationPage