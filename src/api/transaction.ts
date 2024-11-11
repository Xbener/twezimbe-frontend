import Cookies from "js-cookie"
import { toast } from "sonner"
export const fetchAllTransactions = async () => {
    try {
        const token = Cookies.get('access-token')

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions`,
            {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.message || data.errors || "Something went wrong. Please refresh the page")
        return data.transactions
    } catch (error) {
        console.log("failed to fetch transactions", error)
        toast.error("Something went wrong. Please refresh the page")
    }
}