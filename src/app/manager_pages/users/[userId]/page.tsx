'use client'
import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AdminContext } from '@/context/AdminContext';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdateUserAccount } from '@/api/auth';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthday: string;
    home_address?: string;
    office_address?: string;
    role: any;
};

type Props = {};

function Page({ }: Props) {
    const { selectedUser, currentUser } = useContext(AdminContext);
    const { userId } = useParams();
    const { updateAccount, isLoading } = useUpdateUserAccount()
    const { register, handleSubmit, formState: { errors } } = useForm<User>({
        defaultValues: selectedUser || {} // Pre-fill form with selectedUser data
    });

    const onSubmit = async (data: Partial<User>) => {
        try {
            const res = await updateAccount({ ...data, _id: userId as string })
            window.location.href = `/manager_pages/users`;
        } catch (error) {
            toast.error("Something went wrong. Please try again")
            console.log(error)
        }
    };

    return (
        <div className='w-full flex flex-col text-neutral-600'>
            <div className='w-full flex p-2 justify-between items-center'>
                <h1 className='text-md font-bold'>
                    Update {selectedUser?.firstName} {selectedUser?.lastName}'s profile
                </h1>
                <Button
                    disabled={isLoading}
                    onClick={handleSubmit(onSubmit)}
                    className='bg-blue-500 text-slate-50'
                >
                    Update
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                <div className="flex flex-col">
                    <label>First Name</label>
                    <input
                        type="text"
                        {...register('firstName')}
                        className="border p-2 rounded"
                    />
                </div>

                <div className="flex flex-col">
                    <label>Last Name</label>
                    <input
                        type="text"
                        {...register('lastName')}
                        className="border p-2 rounded"
                    />
                </div>

            <div className="w-full flex items-center justify-normal gap-3">
                    <div className="flex flex-col w-full">
                        <label>Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="border p-2 rounded"
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label>Phone</label>
                        <input
                            type="text"
                            {...register('phone')}
                            className="border p-2 rounded"
                        />
                    </div>
            </div>

                <div className="w-full flex items-center justify-start gap-3">
                    <div classNamew-full ="flex flex-col ">
                        <label>Birthday</label>
                        <input
                            type="date"
                            {...register('birthday')}
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="w-full flex flex-col"> 
                        <label>Home Address</label>
                        <input
                            type="text"
                            {...register('home_address')}
                            className="border p-2 rounded"
                        />
                    </div>

                    <div className="w-full flex flex-col"> 
                        <label>Office Address</label>
                        <input
                            type="text"
                            {...register('office_address')}
                            className="border p-2 rounded"
                        />
                    </div>

                    <div className="w-full flex flex-col"> 
                        <label>Role</label>
                        <select
                            disabled={currentUser?._id === userId}
                            {...register('role')}
                            className="border p-2 rounded w-auto disabled:cursor-not-allowed"
                        >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                </div>




            </form>
        </div>
    );
}

export default Page;
