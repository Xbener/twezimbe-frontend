import { toast } from "sonner"
import Cookies from 'js-cookie'
import { Case, PrincipalType, User } from "@/types"

export const getAllBfs = async () => {
    try {
        const token = Cookies.get("access-token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            },
        })
        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data.bfs
    } catch (error) {
        console.log("error fetching bfs", error)
        toast.error("something went wrong. please refresh the page")
    }
}

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

export const addBeneficiary = async (body: { principalId: string, userId: string, bfId: string }) => {
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


export const updatePrincipal = async (principalId: string, body: PrincipalType) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/principal/${principalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        toast.success("principal settings updated successfully")
        return data
    } catch (error) {
        console.log('error updating principal settings', error)
        toast.error("failed to update principal settings")
    }
}

export const getPrincipalSettings = async (principalId: string) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/principal/${principalId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data
    } catch (error) {
        console.log('error getting principal settings', error)
    }
}

export const getCases = async (bfId: string) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/cases/${bfId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        return data
    } catch (error) {
        console.log('error getting cases settings', error)
    }
}
export const fileCase = async (bfId: string, body: { name: string, description: string, principalId?: string, affected?: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/cases/${bfId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to file case. please try again")
        toast.success('case filed successfully')
        return data
    } catch (error) {
        console.log('error filing case', error)
    }
}
export const updateCase = async (caseId: string, body?: any) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/cases/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        toast.success("case updated")
        return data
    } catch (error) {
        console.log('error updating case', error)
        toast.error("failed to update case")
    }
}


export const updateWalletBalance = async (body: { userId: string, walletAddress: string, amount: number, wallet?: string }) => {
    const token = Cookies.get("access-token")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/wallet/balance`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.message)
        toast.success(data.message)
        window.location.reload()
    } catch (error) {
        console.log('error adding balance', error)
        toast.error("failed to add balance")
    }
}


export const makeContribution = async (body: { walletAddress: string, contributor: string, amount: number, contribute_case: string, wallet?: string }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/contributions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.message || data.errors || "failed to contribute. please try again")
        toast.success(data.message)
        window.location.reload()
        return data
    } catch (error) {
        console.log('error contributing', error)
    }
}

export const deleteBf = async (bfId: string) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/${bfId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                }
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || 'Something went wrong. Please try again')
        return data.status
    } catch (error: any) {
        toast.error(error.message)
    }
}