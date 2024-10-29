'use client'
import GroupMemberItem from '@/components/groups/GroupMemberItem';
import { Button } from '@/components/ui/button';
import { GroupContext } from '@/context/GroupContext'
import React, { useContext, useEffect, useState, ChangeEvent } from 'react'
import { toast } from 'sonner';
import Cookies from 'js-cookie'
import LoadingButton from '@/components/LoadingButton';
type Beneficiary = {
    name: string;
    id: number;
}

type FundSettingsPageProps = {}

const FundSettingsPage: React.FC<FundSettingsPageProps> = () => {
    const { group, groupBF, setPrivateChannelMembers } = useContext(GroupContext);

    const [minBeneficiaries, setMinBeneficiaries] = useState<number>(1);
    const [maxBeneficiaries, setMaxBeneficiaries] = useState<number>(5);
    const [contributionAmount, setContributionAmount] = useState<number>(0);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setPrivateChannelMembers([]);
    }, []);

    const handleAddBeneficiary = () => {
        if (beneficiaries.length < maxBeneficiaries) {
            setBeneficiaries([
                ...beneficiaries,
                { name: '', id: beneficiaries.length + 1 }
            ]);
        } else {
            alert(`You can only add up to ${maxBeneficiaries} beneficiaries.`);
        }
    };

    const handleSubscriptionChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlan(e.target.value as 'monthly' | 'annual');
    };

    const handleBeneficiaryNameChange = (index: number, name: string) => {
        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries[index].name = name;
        setBeneficiaries(updatedBeneficiaries);
    };

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/bf/${groupBF?._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ min_beneficiaries: minBeneficiaries, max_beneficiaries: maxBeneficiaries })
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.message || data.error || data.errors)
            toast.success('Bearevement fund settings updated successfully.')
        } catch (error: any) {
            console.log('error updating Bearevement fund', error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 text-white rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold text-center mb-6">
                {groupBF?.fundName} - Fund Settings
            </h1>

            {/* Beneficiaries Section */}
            <section className="mb-6 flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-white">1. Number of Beneficiaries Per Principal</h2>
                <div className="w-full flex items-center gap-2 justify-normal mt-5">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Minimum Beneficiaries:</label>
                        <input
                            type="number"
                            value={minBeneficiaries}
                            onChange={(e) => setMinBeneficiaries(Number(e.target.value))}
                            min={1}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Maximum Beneficiaries:</label>
                        <input
                            type="number"
                            value={maxBeneficiaries}
                            onChange={(e) => setMaxBeneficiaries(Number(e.target.value))}
                            min={1}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                </div>
                {
                    isLoading ? <LoadingButton /> : <Button onClick={handleSubmit} className='bg-blue-500'>Save</Button>
                }
            </section>

            {/* Subscription Section */}
            {/* <section className="mb-6">
                <h2 className="text-lg font-semibold text-white">2. Monthly or Annual Subscription</h2>
                <div className='w-full flex items-center gap-2 justify-normal mt-5'>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Contribution Amount:</label>
                        <input
                            type="number"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(Number(e.target.value))}
                            min={0}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Subscription Plan:</label>
                        <select
                            value={selectedPlan}
                            onChange={handleSubscriptionChange}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual (Discounted)</option>
                        </select>
                    </div>
                </div>
            </section> */}

            <section className="mt-5">
                <h2 className="text-lg font-semibold text-white">2. Invite principals</h2>
                <div className='mt-5 w-full flex flex-col gap-2 h-[400px] overflow-auto'>
                    {
                        group?.members?.map((member) => {

                            return (
                                <div className="w-full flex items-center gap-2">
                                    <GroupMemberItem {...member} />
                                    <Button className="bg-blue-500 text-white">Invite</Button>
                                </div>
                            )
                        })
                    }
                </div>
            </section>


            {/* Add Beneficiaries Section
            <section className="mb-6">
                <h2 className="text-lg font-semibold text-white">3. Add Beneficiaries</h2>
                <button
                    onClick={handleAddBeneficiary}
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded-md hover:bg-blue-500 transition duration-150"
                >
                    Add Beneficiary
                </button>
                <div className="mt-4 space-y-4">
                    {beneficiaries.map((beneficiary, index) => (
                        <div key={index} className="p-2 border-b border-gray-200">
                            <span className="text-gray-700 font-medium">Beneficiary {index + 1}:</span>
                            <input
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                                placeholder="Enter name"
                                value={beneficiary.name}
                                onChange={(e) => handleBeneficiaryNameChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </section> */}

            {/* Payment Options Section */}
            {/* <section className="mb-6">
                <h2 className="text-lg font-semibold text-white">4. Subscription Payment</h2>
                <p className="text-sm text-gray-600">Choose your payment method and plan.</p>
                <div className="mt-4 flex flex-wrap gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-150">
                        Pay by Cash
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-150">
                        Mobile Money
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-150">
                        PayPal
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-150">
                        Credit Card
                    </button>
                </div>
            </section> */}
        </div>
    );
}

export default FundSettingsPage;
