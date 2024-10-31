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
        return data
    } catch (error) {
        console.log('error adding bf member', error)
    }
}

export const applyToJoinBF = async (body: { userId: string, bf_id: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to send request. please try again")
        toast.success(data.message)
        return data
    } catch (error) {
        console.log('error sending request', error)
    }
}


export const acceptRequest = async (body: { userId: string, bf_id: string, requestId: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/requests/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to accept request. please try again")
        toast.success(data.message)
        return data
    } catch (error) {
        console.log('error accepting request', error)
    }
}

export const declineRequest = async (requestId: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to delete request. please try again")
        toast.success(data.message)
        return data
    } catch (error) {
        console.log('error deleting request', error)
    }
}

export const getFundSettings = async (bf_id: string) => {
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/bf/${bf_id}`, {})
        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data.settings
    } catch (error) {
        console.log('error getting Fund Settings', error)
    }
}

export const addBeneficiary = async (body: {principalId: string, userId: string, bfId: string}) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/beneficiary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to add beneficiary. please try again")
        toast.success(data.message)
        return data
    } catch (error) {
        console.log('error adding beneficiary', error)
    }
}


export const getBeneficiaries = async (bfId: string, principalId: string) => {
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/beneficiary/${principalId}/${bfId}`, {})
        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data.beneficiaries
    } catch (error) {
        console.log('error getting Beneficiaries', error)
    }
}


export const removeBeneficiary = async (body: { principalId: string, userId: string, bfId: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/beneficiary/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to remove beneficiary. please try again")
        toast.success(data.message)
        return data
    } catch (error) {
        console.log('error removing beneficiary', error)
    }
}
