'use client'
import { createQuestion } from '@/api/inquries'
import React from 'react'
import { useForm } from 'react-hook-form';
import { Form } from '../ui/form'

type FormData = {
    fullName: string
    email: string
    message: string
}

type Props = {}

function ContactUs({ }: Props) {
    const form = useForm<FormData>({
        defaultValues: {
            email: "",
            fullName: "",
            message: ""
        }
    })
    const onSubmit = async (data: FormData) => {
        const res = await createQuestion(data)
    }

    return (
        <div className="w-full p-4 flex flex-col md:flex-row gap-2">
            <div className='w-full md:w-1/2 flex flex-col gap-3 p-3 '>
                <h1 className="text-lg font-bold mb-4">Send us a message</h1>
                <p>
                    Simply fill in your full name, email address, and message, and we’ll be ready to assist you. Our form provides clear guidance with helpful error messages to ensure your message reaches us accurately. We look forward to hearing from you and will respond as soon as possible!
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-1/2 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input
                        {...form.register("fullName", { required: "Full Name is required" })}
                        className="w-full border p-2 rounded"
                    />
                    {form.formState.errors.fullName && (
                        <p className="text-red-600 text-sm">{form.formState.errors.fullName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        {...form.register("email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                        })}
                        className="w-full border p-2 rounded"
                    />
                    {form.formState.errors.email && (
                        <p className="text-red-600 text-sm">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Message</label>
                    <textarea
                        {...form.register("message", { required: "Message is required" })}
                        className="w-full border p-2 rounded"
                        rows={4}
                    />
                    {form.formState.errors.message && (
                        <p className="text-red-600 text-sm">{form.formState.errors.message.message}</p>
                    )}
                </div>

                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
                    Submit
                </button>
            </form>
        </div>
    )
}

export default ContactUs
