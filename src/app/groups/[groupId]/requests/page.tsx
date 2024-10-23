'use client'
import { XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { GroupJoinRequestTypes, GroupTypes, JoinGroupTypes, User } from '@/types'
import { iconTextGenerator } from '@/lib/iconTextGenerator'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'

type Props = {}

function GroupRequests({ }: Props) {

    const [loading, setLoading] = useState(false)
    const [groupRequests, setGroupRequests] = useState<GroupJoinRequestTypes[]>([])
    const { groupId } = useParams()
    const router = useRouter()

    const getGroupRequests = async () => {
        try {
            setLoading(true)
            const accessToken = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/requests/${groupId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.message || data.errors)
            setGroupRequests(data.groupRequests)
        } catch (error) {
            toast.error("Something went wrong. Please refresh the page")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getGroupRequests()
    }, [groupId])

    const acceptRequest = async (request: GroupJoinRequestTypes) => {
        try {
            setLoading(true)
            const accessToken = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/requests`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requestId: request._id, userId: request?.user.id, groupId: request.group._id })
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.message || data.errors)
            toast.success("Request Accepted successfully")
            setGroupRequests(prev => {
                return prev.filter(prevRequest => prevRequest._id !== request._id)
            })
        } catch (error) {
            toast.error("Something went wrong. Please refresh the page")
        } finally {
            setLoading(false)
        }
    }

    const declineRequest = async (request: GroupJoinRequestTypes) => {
        try {
            setLoading(true)
            const accessToken = Cookies.get('access-token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/requests?userId=${request.user._id}&groupId=${request.group._id}&requestId=${request._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.message || data.errors)
            toast.success("Request removed successfully")
            setGroupRequests(prev => {
                return prev.filter(prevRequest => prevRequest._id !== request._id)
            })
        } catch (error) {
            toast.error("Something went wrong. Please refresh the page")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <div className='border-b border-white p-3 text-[1.2rem] flex items-center gap-2'>
                <Button disabled={loading} onClick={() => router.back()}>
                    <XCircle color={"white"} />
                </Button>
                <h1 className='font-bold capitalize'>Join requests</h1>
            </div>

            <div className='w-full flex flex-col gap-3'>
                {
                    groupRequests?.length! <= 0 && (
                        <div className="w-full p-5 grid place-content-center">
                            <h1>No Requests Found</h1>
                        </div>
                    )
                }
                {
                    groupRequests.map((request: GroupJoinRequestTypes, index) => (
                        <div className='flex w-full justify-between items-center p-3'>
                            <div className="flex items-center justify-normal gap-5 p-3">
                                <Avatar>
                                    <AvatarImage src={request.user.profile_pic} className="bg-black w-[60px] h-[60px] rounded-full" />
                                    <AvatarFallback>{iconTextGenerator(request.user.firstName, request.user.lastName)}</AvatarFallback>
                                </Avatar>

                                <h1>{request.user.firstName} {request.user.lastName}</h1>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Button onClick={() => acceptRequest(request)} disabled={loading} className={`bg-blue-500 text-white`}
                                >
                                    Accept
                                </Button>
                                <Button onClick={() => declineRequest(request)} disabled={loading} className={`border-orange-500 border text-orange-500`}
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default GroupRequests