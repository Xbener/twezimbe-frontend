import { toast } from "sonner"
import Cookies from 'js-cookie'
import { User } from "@/types"


export const updateUserRole = async (userId: string, new_role: string, bf_id: string) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, role: new_role, bf_id })
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        toast.success("user role updated successfully")
        return data.bf_user
    } catch (error) {
        console.log('error updating BF member role', error)
        toast.error("failed to update member role")
    }
}


export const getBfMembers = async (bf_id: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/members/${bf_id}`, {})
        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data.members
    } catch (error) {
        console.log('error getting bf members', error)
    }
}

export const addBfMember = async ({ role, bf_id, user, setBfMembers }: { role?: string, user: User, bf_id: string, setBfMembers: (vl: any) => void }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify({ role, bf_id, userId: user?._id })
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to add new member")
        toast.success(data.message || 'successfully added new member')
        setBfMembers((prev: any) => ([...prev.filter((prevMember: any) => prevMember?._id !== data?.newBfMember?._id), { ...data.newMember, user, role, createdAt: new Date() }]))
        return data.newBfMember
    } catch (error) {
        console.log('error adding bf member', error)
    }
}