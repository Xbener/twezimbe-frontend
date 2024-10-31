'use client'
import { useGetProfileData } from '@/api/auth';
import GroupMemberItem from '@/components/groups/GroupMemberItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GroupContext } from '@/context/GroupContext';
import { addBeneficiary, getBeneficiaries, removeBeneficiary } from '@/lib/bf';
import { Beneficiary } from '@/types';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent, useContext, useEffect } from 'react'
import { toast } from 'sonner';

type Props = {}
function page({ }: Props) {

    const { bfSettings, group, groupBF } = useContext(GroupContext)
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
    const [beneficiaryQuery, setBeneficiaryQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    const { currentUser } = useGetProfileData()
    const [groupQuery, setGroupQuery] = useState('')
    const [bfQuery, setBfQuery] = useState('')

    useEffect(() => {
        async function getData() {
            const beneficiaries = await getBeneficiaries(groupBF?._id!, currentUser?._id!)
            setBeneficiaries(beneficiaries || [])
        }

        if (groupBF && currentUser) {
            getData()
        }
    }, [groupBF, currentUser])
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleAddBeneficiary = () => {
        if (beneficiaries.length < bfSettings?.maxBeneficiaries!) {

        } else {
            toast.error(`You can only add up to ${bfSettings?.maxBeneficiaries!} beneficiaries.`);
        }
    };

    const filterGroupMembers = (q: string) => {
        const filteredMembers = group?.members.filter(member => {
            const fullName = `${member.lastName} ${member.firstName}`
            return fullName.toLowerCase().includes(q.toLowerCase()) ||
                member.lastName.toLowerCase().includes(q.toLowerCase()) ||
                member.firstName?.toLowerCase().includes(q.toLowerCase());
        });
        return filteredMembers;
    }
    let filteredGroupMembers = filterGroupMembers(groupQuery)
    useEffect(() => {
        filteredGroupMembers = filterGroupMembers(groupQuery)
    }, [groupQuery])

    return (
        <div className='max-w-2xl mx-auto p-6 text-white rounded-lg shadow-md mt-10'>
            <XIcon
                className="cursor-pointer border rounded-md mb-5"
                onClick={() => router.back()}
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
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-semibold text-white">8. Beneficiaries (add up to {bfSettings?.maxBeneficiaries})</h2>
                    <Dialog>
                        <DialogTrigger>
                            <Input
                                className="w-full"
                                value={beneficiaryQuery}
                                onChange={(e) => setBeneficiaryQuery(e.target.value)}
                                placeholder={`Search to add beneficiary ...`}
                                type="text"
                            />
                        </DialogTrigger>
                        <DialogContent className="w-full bg-white">
                            <Input
                                className="w-full"
                                value={groupQuery}
                                onChange={(e) => setGroupQuery(e.target.value)}
                                placeholder={`Search among the group members to add beneficiary ...`}
                                type="text"
                            />

                            <div className="mt-5">
                                <div className='mt-5 w-full flex flex-col gap-2 '>
                                    {
                                        filteredGroupMembers?.map((member) => {
                                            if (member?._id === currentUser?._id) return null
                                            if (beneficiaries.find(bn => bn.beneficiary?._id === member?._id)) return null
                                            return (
                                                <div className="w-full flex items-center gap-2">
                                                    <GroupMemberItem {...member} />
                                                    <Button
                                                        className="bg-blue-500 text-white"
                                                        onClick={async () => {
                                                            const { beneficiary, status } = await addBeneficiary({ principalId: currentUser?._id!, userId: member?._id!, bfId: groupBF?._id! })
                                                            status && setBeneficiaries(prev => {
                                                                return [...prev, { principal: currentUser!, beneficiary: member }]
                                                            })
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="mt-4 space-y-4">
                    {beneficiaries && beneficiaries.map((beneficiary, index) => (
                        <div className="w-full flex items-center gap-2">
                            <GroupMemberItem {...beneficiary.beneficiary} />
                            <Button
                                className="bg-orange-500 text-white"
                                onClick={async () => {
                                    const { status } = await removeBeneficiary({ principalId: currentUser?._id!, userId: beneficiary.beneficiary._id!, bfId: groupBF?._id! })
                                    setBeneficiaries(prev => {
                                        return prev.filter(prev => prev.beneficiary._id !== beneficiary.beneficiary?._id)
                                    })
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default page
