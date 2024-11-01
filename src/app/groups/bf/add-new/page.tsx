'use client'
import { GroupContext } from '@/context/GroupContext';
import React, { useContext, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import LoadingButton from '@/components/LoadingButton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { generateProfileID } from '@/utils/generateID';

type Props = {};

interface FormData {
    fundName: string;
    fundDetails: string;
    accountType: 'bank' | 'mobile' | 'wallet';
    accountInfo: string;
    walletAddress: string;
}

function BereavementFundPage({ }: Props) {
    const { selectedGroup: group } = useContext(GroupContext);
    const router = useRouter()
    const wallet = useRef("")

    useEffect(() => {
        wallet.current = generateProfileID("")
    }, [])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isLoading, isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            fundName: '',
            fundDetails: '',
            accountType: 'bank',
            accountInfo: '',
            walletAddress: wallet.current
        },
    });

    // Watch the accountType field to dynamically change validation
    const accountType = watch('accountType');

    if (group?.has_bf) return window.location.href = `/groups/${group._id}`;

    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                },
                body: JSON.stringify({ ...data, groupId: group?._id }),
            });
            const results = await res.json()
            if (!results.status) throw new Error(results.error || results.errors || results.message)
            router.push(`/groups/${group?._id}`)
        } catch (error: any) {
            console.error("Error creating fund:", error);
            toast.error(error.message || "Something went wrong.Please try again")
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col items-center py-10 px-6 overflow-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6 text-center">
                Create a Bereavement Fund for {group?.group_name}
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-gray-50 p-8 rounded-lg shadow-md space-y-6">
                {/* Fund Name */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundName">
                        Name of Fund
                    </label>
                    <input
                        type="text"
                        id="fundName"
                        {...register("fundName", { required: "Fund name is required" })}
                        className={`w-full px-4 py-2 border ${errors.fundName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                        placeholder="Enter fund name"
                    />
                    {errors.fundName && <p className="text-red-500 text-sm mt-1">{errors.fundName.message}</p>}
                </div>

                {/* Fund Details */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundDetails">
                        Fund Details
                    </label>
                    <textarea
                        id="fundDetails"
                        {...register("fundDetails", { required: "Fund details are required" })}
                        className={`w-full px-4 py-2 border ${errors.fundDetails ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                        placeholder="Enter fund details"
                        rows={4}
                    />
                    {errors.fundDetails && <p className="text-red-500 text-sm mt-1">{errors.fundDetails.message}</p>}
                </div>


                {/* Account Type Selection */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2">
                        Account Type
                    </label>
                    <select
                        {...register("accountType")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
                    >
                        <option value="bank">Bank Account</option>
                        <option value="mobile">Mobile Money Account</option>
                        <option value="wallet">BF Virtual Wallet</option>
                    </select>
                </div>

                {/* Account Info / Wallet Address */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2">
                        {accountType === 'wallet' ? 'Wallet Address' : 'Account Info'}
                    </label>
                    <input
                        type="text"
                        {...register("accountInfo", {
                            required: accountType === 'wallet' ? "Wallet address is required" : "Account info is required",
                        })}
                        className={`w-full px-4 py-2 border ${errors.accountInfo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                        // value={}
                        placeholder={
                            accountType === 'wallet'
                                ? 'Enter virtual wallet address'
                                : 'Enter account number or mobile money details'
                        }
                    />
                    {errors.accountInfo && <p className="text-red-500 text-sm mt-1">{errors.accountInfo.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    {
                        isLoading || isSubmitting ? (
                            <LoadingButton />
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition duration-200"
                            >
                                Create Fund
                            </button>
                        )
                    }
                </div>
            </form>
        </div>
    );
}

export default BereavementFundPage;
