import { toast } from "sonner"
import Cookies from "js-cookie"

export const deleteQuestion = async (questionId: string) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/questions/${questionId}`,
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
        return data.status
    } catch (error: any) {
        toast.error(error.message)
    }
}
export const updateQuestion = async (questionId: string, answer: string) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/questions/${questionId}`,
            {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ answer })
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
        return data
    } catch (error: any) {
        toast.error(error.message)
    }
}
export const getAllQuestions = async () => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/questions`,
            {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                }
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        // toast.success(data.message)
        return data.questions
    } catch (error) {
        console.log(error)
    }
}
export const createQuestion = async (question: { fullName: string, email: string, message: string }) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/questions`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ ...question })
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
    } catch (error: any) {
        toast.error(error.message)
    }
}



export const getFaqs = async () => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/faqs`,
            {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                }
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        // toast.success(data.message)
        return data.faqs
    } catch (error) {
        console.log(error)
    }
}
export const createFaq = async (faq: { question: string, answer: string }) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/faqs`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ ...faq })
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
        return data
    } catch (error: any) {
        toast.error(error.message)
    }
}
export const updateFaq = async (faqId: string, faq: { question?: string, answer?: string }) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/faqs/${faqId}`,
            {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
                body: JSON.stringify({ ...faq })
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
        return data
    } catch (error: any) {
        toast.error(error.message)
    }
}

export const deleteFaq = async (faqId: string) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/faqs/${faqId}`,
            {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`
                },
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.errors || data.message || "Something went wrong. Please try again")
        toast.success(data.message)
        return data
    } catch (error: any) {
        toast.error(error.message)
    }
}
