'use client'
import { GroupContext } from '@/context/GroupContext'
import React, { useContext, useState } from 'react';

type Props = {}

function BereavementFundPage({ }: Props) {
    const { selectedGroup: group } = useContext(GroupContext);

    const [formData, setFormData] = useState({
        fundName: '',
        fundDetails: '',
        accountType: 'bank',
        accountInfo: '',
        walletAddress: '',
    });

    if (!group) return window.location.href = '/groups';
    if (group?.has_bf) return window.location.href = `/groups/${group._id}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Handle form submission
        } catch (error) {
            console.error("Error creating fund:", error);
        }
    }

    return (
        <div className="bg-white min-h-screen flex flex-col items-center py-10 px-6 overflow-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6 text-center">
                Create a Bereavement Fund for {group?.group_name}
            </h1>
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-gray-50 p-8 rounded-lg shadow-md space-y-6">
                {/* Fund Name */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundName">
                        Name of Fund
                    </label>
                    <input
                        type="text"
                        id="fundName"
                        name="fundName"
                        value={formData.fundName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
                        placeholder="Enter fund name"
                    />
                </div>

                {/* Fund Details */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2" htmlFor="fundDetails">
                        Fund Details
                    </label>
                    <textarea
                        id="fundDetails"
                        name="fundDetails"
                        value={formData.fundDetails}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
                        placeholder="Enter fund details"
                        rows={4}
                    />
                </div>

                {/* Created by and Roles */}
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">
                        Created by: {group?.created_by?.lastName || 'Admin'}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">Roles:</p>
                    <ul className="list-disc pl-6 text-gray-600 text-sm">
                        <li>Admins</li>
                        <li>Supervisors</li>
                        <li>Approvers</li>
                        <li>Principals</li>
                        <li>Beneficiaries</li>
                    </ul>
                </div>

                {/* Account Type Selection */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2">
                        Account Type
                    </label>
                    <select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
                    >
                        <option value="bank">Bank Account</option>
                        <option value="mobile">Mobile Money Account</option>
                        <option value="wallet">BF Virtual Wallet</option>
                    </select>
                </div>

                {/* Account Info Input */}
                <div>
                    <label className="block text-black text-sm font-semibold mb-2">
                        {formData.accountType === 'wallet' ? 'Wallet Address' : 'Account Info'}
                    </label>
                    <input
                        type="text"
                        name="accountInfo"
                        value={formData.accountInfo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
                        placeholder={
                            formData.accountType === 'wallet'
                                ? 'Enter virtual wallet address'
                                : 'Enter account number or mobile money details'
                        }
                    />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition duration-200"
                    >
                        Create Fund
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BereavementFundPage;
