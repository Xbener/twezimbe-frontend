'use client'
import { useGetProfileData } from '@/api/auth';
import GroupMemberItem from '@/components/groups/GroupMemberItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GroupContext } from '@/context/GroupContext';
import { addBeneficiary, getBeneficiaries, getPrincipalSettings, removeBeneficiary, updatePrincipal } from '@/lib/bf';
import { Beneficiary, PrincipalType } from '@/types';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent, useContext, useEffect } from 'react'
import { toast } from 'sonner';
import Cookies from 'js-cookie'
import LoadingButton from '@/components/LoadingButton';
import { formatWithCommas } from '@/utils/formatNumber';
type Props = {}
function page({ }: Props) {

    const { bfSettings, group, groupBF } = useContext(GroupContext)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formValues, setFormValues] = useState<PrincipalType>({
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
    const [principalSettings, setPrincipalSettings] = useState<PrincipalType | null>(null)
    const router = useRouter()
    const { currentUser } = useGetProfileData()
    const [groupQuery, setGroupQuery] = useState('')
    const [bfQuery, setBfQuery] = useState('')


    useEffect(() => {
        async function getData() {
            const { status, principal } = await getPrincipalSettings(currentUser?._id!)
            const beneficiaries = await getBeneficiaries(groupBF?._id!, currentUser?._id!)
            if (principal && status) {
                setPrincipalSettings(principal)
                setFormValues(principal)
            }
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
            <div className="w-full flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-white">Principal settings</h2>
                {
                    !isEditing && (
                        <Button
                            onClick={() => setIsEditing(prev => !prev)}
                            className="bg-blue-500 text-white"
                        >Edit</Button>
                    )
                }
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {
                    isEditing ? (
                        <>
                            <section>
                                <h2 className="text-lg font-semibold text-white">1. One-off membership fee</h2>
                                <label className="block text-sm font-medium text-neutral-300">Set membership fee (UGX):</label>
                                <input
                                    type="number" min={0}
                                    name="membershipFee"
                                    value={formValues.membershipFee}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                                />
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-white">2. Annual subscription</h2>
                                <label className="block text-sm font-medium text-neutral-300">Annual subscription fee (UGX):</label>
                                <input
                                    type="number" min={0}
                                    name="annualSubscription"
                                    value={formValues.annualSubscription}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                                />
                            </section>

                            <section>
                                <h2 className="text-md font-semibold text-white">3. Preferred subscription payment plan</h2>
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
                                <h2 className="text-lg font-semibold text-white">4. Select payment method</h2>
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
                                <h2 className="text-lg font-semibold text-white">5. Add payment details</h2>
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
                                <h2 className="text-lg font-semibold text-white">6. Set payment to auto</h2>
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
                                <h2 className="text-lg font-semibold text-white">7. Set payment due reminders</h2>
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
                        </>
                    ) : (
                        <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md text-white w-full col-span-2">
                            <section>
                                <h2 className="text-lg font-semibold">1. One-off Membership Fee</h2>
                                <p className="text-neutral-300">UGX {formatWithCommas(formValues.membershipFee.toLocaleString())}</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">2. Annual Subscription</h2>
                                <p className="text-neutral-300">UGX {formatWithCommas(formValues.annualSubscription.toLocaleString())}</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">3. Preferred Payment Plan</h2>
                                <p className="text-neutral-300">
                                    {formValues.selectedPlan === "other" ? "Other (Instalments)" : formValues.selectedPlan.charAt(0).toUpperCase() + formValues.selectedPlan.slice(1)}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">4. Payment Method</h2>
                                <p className="text-neutral-300">{formValues.paymentMethod}</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">5. Payment Details</h2>
                                <p className="text-neutral-300">{formValues.paymentDetails || "Not provided"}</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">6. Auto Payment</h2>
                                <p className="text-neutral-300">{formValues.autoPayment ? "Enabled" : "Disabled"}</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold">7. Payment Due Reminder</h2>
                                <p className="text-neutral-300">
                                    {formValues.dueReminder === "day" ? "A day before expiry" :
                                        formValues.dueReminder === "week" ? "A week before expiry" :
                                            "A month before expiry"}
                                </p>
                            </section>
                        </div>
                    )
                }

                {
                    isLoading ? <LoadingButton /> : isEditing ? (
                        <div className="w-full flex items-center mt-5 gap-3">
                            <Button onClick={async () => {
                                setIsLoading(true)
                                const { status, principal } = await updatePrincipal(currentUser?._id!, formValues)
                                setIsLoading(false)
                                status && setPrincipalSettings(principal)
                                setIsEditing(false)
                            }} className="bg-blue-500 text-white">Save</Button>
                            <Button onClick={() => {
                                setIsEditing(false)
                                principalSettings && setFormValues(principalSettings!)
                            }} className="bg-gray-600">Cancel </Button>
                        </div>
                    ) : null
                }
            </div>
        </div>
    )
}

export default page
