'use client'
import React, { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type FormValues = {
    email: string;
    password: string;
}

type Props = {}

function AdminLoginPage({ }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()
    const router = useRouter()

    useEffect(() => {
        if (Cookies.get('access-token') && Cookies.get('admin') === 'true') router.push('/manager_pages')
    }, [])
    const onSubmit: SubmitHandler<FormValues> = async data => {
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/admin/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.errors || responseData.message);
            }

            Cookies.set('access-token', responseData.token, {});
            Cookies.set('admin', 'true', {})
            window.location.href = '/manager_pages'
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className='w-full h-[100dvh] bg-[#013a6fae] flex items-center justify-center text-white'>
            <div className='w-2/5 border shadow-md rounded-md p-4'>
                <h1 className='text-2xl font-bold text-center mb-4'>Admin Login</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor='email' className="block text-sm font-medium mb-1">Email</label>
                        <input
                            id='email'
                            placeholder='Enter email address'
                            type="email"
                            {...register("email", { required: "Email is required" })}
                            className="w-full p-2 border rounded-md bg-transparent text-white"
                        />
                        {errors.email && <p className="text-red-700 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='password' className="block text-sm font-medium mb-1">Password</label>
                        <input
                            id='password'
                            placeholder='enter password'
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className="w-full p-2 border rounded-md bg-transparent text-white"
                        />
                        {errors.password && <p className="text-red-700 text-sm">{errors.password.message}</p>}
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full mt-4 p-2 bg-white text-blue-500 font-semibold rounded-md hover:bg-gray-200"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AdminLoginPage
