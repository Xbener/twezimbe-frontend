'use client'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GroupContext } from '@/context/GroupContext';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent, useContext } from 'react'
import { toast } from 'sonner';

type Props = {}
type Beneficiary = {
    name: string;
    id: number;
}

function page({ }: Props) {

    const {bfSettings} = useContext(GroupContext)
    const [formValues, setFormValues] = useState({
        contributionAmount: 0,
        membershipFee: 0,
        annualSubscription: 0,
        selectedPlan: 'monthly' as 'monthly' | 'annual' | 'other',
        paymentMethod: 'Mobile Money',
        paymentDetails: '',
        autoPayment: false,
        dueReminder: 'week'
    });
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleAddBeneficiary = () => {
        if (beneficiaries.length < bfSettings?.maxBeneficiaries!) {
            setBeneficiaries([
                ...beneficiaries,
                { name: '', id: beneficiaries.length + 1 }
            ]);
        } else {
            toast.error(`You can only add up to ${bfSettings?.maxBeneficiaries!} beneficiaries.`);
        }
    };

    const handleBeneficiaryNameChange = (index: number, name: string) => {
        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries[index].name = name;
        setBeneficiaries(updatedBeneficiaries);
    };

    return (
        <div className='max-w-2xl mx-auto p-6 text-white rounded-lg shadow-md mt-10'>
            <XIcon
            className="cursor-pointer border rounded-md mb-5"
            onClick={()=>router.back()}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <section>
                    <h2 className="text-lg font-semibold text-white">1. One-off Membership Fee</h2>
                    <label className="block text-sm font-medium text-gray-700">Set Membership Fee (UGX):</label>
                    <input
                        type="number"
                        name="membershipFee"
                        value={formValues.membershipFee}
                        onChange={handleInputChange}
                        min={0}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    />
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">2. Annual Subscription</h2>
                    <label className="block text-sm font-medium text-gray-700">Annual Subscription Fee (UGX):</label>
                    <input
                        type="number"
                        name="annualSubscription"
                        value={formValues.annualSubscription}
                        onChange={handleInputChange}
                        min={0}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    />
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-white">3. Preferred Subscription Payment Plan</h2>
                    <select
                        name="selectedPlan"
                        value={formValues.selectedPlan}
                        onChange={handleInputChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                        >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual (Discounted)</option>
                        <option value="other">Other (Define Instalments)</option>
                    </select>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">4. Select Payment Method</h2>
                    <select
                        name="paymentMethod"
                        value={formValues.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    >
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Visa">Visa</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Payoneer">Payoneer</option>
                        <option value="Cash">Cash</option>
                    </select>
                </section>

                <section className="md:col-span-2">
                    <h2 className="text-lg font-semibold text-white">5. Add Payment Details</h2>
                    <input
                        type="text"
                        name="paymentDetails"
                        placeholder="Enter payment details"
                        value={formValues.paymentDetails}
                        onChange={handleInputChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    />
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">6. Set Payment to Auto</h2>
                    <select
                        name="autoPayment"
                        value={formValues.autoPayment ? 'Yes' : 'No'}
                        onChange={(e) => setFormValues(prev => ({
                            ...prev,
                            autoPayment: e.target.value === 'Yes'
                        }))}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">7. Set Payment Due Reminders</h2>
                    <select
                        name="dueReminder"
                        value={formValues.dueReminder}
                        onChange={handleInputChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                    >
                        <option value="day">A day before expiry</option>
                        <option value="week">A week before expiry</option>
                        <option value="month">A month before expiry</option>
                    </select>
                </section>
            </div>

            <section className="mb-6">
              <div className="flex items-center sm:flex-col flex-col justify-between w-full">
                  <h2 className="text-lg font-semibold text-white">8. Beneficiaries (add up to {bfSettings?.maxBeneficiaries})</h2>
                <button
                    onClick={handleAddBeneficiary}
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded-md hover:bg-blue-500 transition duration-150"
                >
                    Add Beneficiary
                </button>
              </div>
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
            </section>
        </div>
    )
}

export default page
