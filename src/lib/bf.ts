import { toast } from "sonner"
import Cookies from 'js-cookie'


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

export const addBfMember = async ({ role, bf_id, userId }: { role?: string, userId: string, bf_id: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify({ role, bf_id, userId })
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message)
        toast.success(data.message)
        return data.newBfMember
    } catch (error) {
        console.log('error adding bf member', error)
    }
}