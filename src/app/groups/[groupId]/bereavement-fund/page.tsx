'use client'
import GroupMemberItem from '@/components/groups/GroupMemberItem';
import { Button } from '@/components/ui/button';
import { GroupContext } from '@/context/GroupContext'
import React, { useContext, useEffect, useState, ChangeEvent, useRef, useLayoutEffect } from 'react'
import { toast } from 'sonner';
import Cookies from 'js-cookie'
import LoadingButton from '@/components/LoadingButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { iconTextGenerator } from '@/lib/iconTextGenerator';
import { acceptRequest, addBfMember, declineRequest, fileCase, getCases, updateUserRole, updateCase } from '@/lib/bf';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetProfileData } from '@/api/auth';
import { Case, FundSettings } from '@/types';
import { useRouter } from 'next/navigation';
import { XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatNumberWithCommas } from '@/utils/formatNumber';
import { countryCodes } from '@/constants';
import moment from 'moment'

type Beneficiary = {
    name: string;
    id: number;
}

type FundSettingsPageProps = {}

const FundSettingsPage: React.FC<FundSettingsPageProps> = () => {
    const { group, groupBF, bfSettings, setBfSettings, setPrivateChannelMembers, bfMembers, setBfMembers, bfMembersRef, bfJoinRequests } = useContext(GroupContext);
    const [groupQuery, setGroupQuery] = useState('')
    const [bfQuery, setBfQuery] = useState('')
    const [fundSettings, setFundSettings] = useState<FundSettings>(bfSettings as FundSettings)
    const [isLoading, setIsLoading] = useState(false)
    const { currentUser } = useGetProfileData()
    const [newBfMembers, setNewBfMembers] = useState(bfMembers)
    const [allMembers, setAllMembers] = useState(group?.members)
    const router = useRouter()
    const [payForm, setPayForm] = useState({
        open: false,
        data: {
            amount: "",
            phone: "",
            countryCode: countryCodes[0].code
        }
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newCase, setNewCase] = useState({
        name: '',
        description: '',
        principalId: currentUser?._id
    })
    const [isEditing, setIsEditing] = useState(false)
    const [cases, setCases] = useState<Case[]>([])

    useEffect(() => {
        setFundSettings(bfSettings as FundSettings)
    }, [bfSettings])

    useEffect(() => {
        const getData = async () => {
            const { cases, status } = await getCases(groupBF?._id!)
            if (status) setCases(cases)
        }
        if (groupBF) {
            getData()
        }
    }, [])

    const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        setPayForm(prev => ({ ...prev, data: { ...prev.data, countryCode } }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Split the name into parts to access nested properties
        const nameParts = name.split('.');

        setFundSettings(prevSettings => {
            // Create a shallow copy of the previous settings
            const newSettings = { ...prevSettings };

            // Navigate to the nested property using the name parts
            let current: any = newSettings; // Use 'any' to bypass the index signature issue
            for (let i = 0; i < nameParts.length - 1; i++) {
                current = current[nameParts[i]]; // This will be type-checked by TypeScript
            }

            // If the input is a number, remove commas for the underlying value but display formatted with commas
            if (type === 'number' || name.includes("subscription_costs")) {
                // Remove commas from value for state update
                const rawValue = value.replace(/,/g, '');
                current[nameParts[nameParts.length - 1] as keyof typeof current] = rawValue; // Set unformatted value in state

                // Display formatted value with commas
                e.target.value = formatNumberWithCommas(rawValue);
            } else {
                // Set the new value for the last part of the name for non-number inputs
                current[nameParts[nameParts.length - 1] as keyof typeof current] = value;
            }

            return newSettings;
        });
    };

    useEffect(() => {
        setAllMembers(group?.members)
    }, [group])
    useEffect(() => {
        setNewBfMembers(bfMembers)
    }, [bfMembers])


    const roles = useRef([
        'admin',
        'supervisor',
        'hr',
        'manager',
        'coordinator',
        'counselor',
        'principal',
    ])

    useEffect(() => {
        setPrivateChannelMembers([]);
    }, []);

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/settings/bf/${groupBF?._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('access-token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fundSettings)
            })

            const data = await res.json()
            if (!data.status) return toast.error(data.message || data.error || data.errors)
            toast.success('You have saved successfully.')
            setBfSettings(data.settings)
            setFundSettings(data.settings)
            setIsEditing(false)
        } catch (error: any) {
            console.log('error updating Bereavement fund', error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }
    const filterGroupMembers = (q: string) => {
        const filteredMembers = group?.members.filter(member => {
            const fullName = `${member.lastName} ${member.firstName}`
            return fullName.toLowerCase().includes(q.toLowerCase()) ||
                member.lastName.toLowerCase().includes(q.toLowerCase()) ||
                member.firstName?.toLowerCase().includes(q.toLowerCase());
        });
        return filteredMembers;
    }
    const filterBfMembers = (q: string) => {
        const filteredMembers = newBfMembers && newBfMembers?.filter(member => {
            const fullName = `${member.user.lastName} ${member.user.firstName}`
            return fullName.toLowerCase().includes(q.toLowerCase()) ||
                member.user.lastName.toLowerCase().includes(q.toLowerCase()) ||
                member.user.firstName?.toLowerCase().includes(q.toLowerCase());
        });
        return filteredMembers;
    }
    const filteredGroupMembers = filterGroupMembers(groupQuery)
    let filteredBfMembers = filterBfMembers(bfQuery)
    useEffect(() => {
        filterGroupMembers(groupQuery)
    }, [groupQuery])

    useEffect(() => {
        filteredBfMembers = filterBfMembers(bfQuery)
    }, [bfQuery, bfMembers])

    function makePayment() {
        if (payForm.data.amount !== "" && payForm.data.amount !== "0" && payForm.data.phone !== "") {
            FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-61fd8c76063ac4c81570ea26a682c719-X",
                tx_ref: "txref-DI0NzMx13",
                amount: payForm.data.amount,
                currency: "UGX",
                payment_options: "mobilemoneyrwanda, mobilemoneyuganda",
                meta: {
                    source: "docs-inline-test",
                    consumer_mac: "92a3-912ba-1192a",
                },
                customer: {
                    email: currentUser?.email,
                    phone_number: `${payForm.data.countryCode}${payForm.data.phone}`,
                    name: `${currentUser?.firstName} ${currentUser?.lastName}`,
                },
                customizations: {
                    title: "Deposit funds",
                    description: "Add funds to your Bereavement Fund",
                    logo: "https://checkout.flutterwave.com/assets/img/rave-logo.png",
                },
                // callback: () => handleUpgrade(),
                onclose: function () {
                    console.log("Payment cancelled!");
                }
            });
        } else {
            toast.error("Enter the required info to make a contribution")
        }
    }

    if (fundSettings) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-white rounded-lg shadow-md mt-10 bg-[rgba(26,65,116,0.36)] ">
                <div className="flex items-center gap-4">
                    <XIcon
                        className="cursor-pointer border rounded-md mb-5"
                        onClick={() => router.back()}
                    />
                    <h1 className="text-2xl font-bold text-center mb-6">
                        {groupBF?.fundName} - Fund settings
                    </h1>

                </div>

                {
                    isEditing ? (
                        <>
                            <section className="mb-6 flex flex-col gap-2">

                                <h2 className="text-lg font-semibold text-white">1. Number of beneficiaries per principal</h2>
                                <div className="w-full flex items-center gap-2 justify-normal mt-5">
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-neutral-300">Minimum beneficiaries:</label>
                                        <input
                                            type="number" name="minBeneficiaries"
                                            value={(fundSettings.minBeneficiaries)}
                                            onChange={handleChange}
                                            min={1}
                                            className="w-full text-right p-2 mt-1 border border-gray-300 rounded-md text-black"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-neutral-300">Maximum beneficiaries:</label>
                                        <input
                                            type="number" value={fundSettings.maxBeneficiaries}
                                            name="maxBeneficiaries"
                                            onChange={handleChange}
                                            min={1}
                                            className="w-full p-2 text-right mt-1 border border-gray-300 rounded-md text-black"
                                        />
                                    </div>
                                </div>

                            </section>

                            <section className="mt-5">
                                <h2 className="text-lg font-semibold text-white">2. Membership fee (One-off)</h2>
                                <label className="block text-sm font-medium text-neutral-300">Set membership fee:</label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Enter membership fee (UGX)"
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black text-right"
                                    name="membership_fee"
                                    onChange={handleChange}
                                    value={fundSettings.membership_fee}
                                />
                            </section>

                            <section className="mt-5">
                                <h2 className="text-lg font-semibold text-white">3. Fund subscription costs</h2>
                                <div className="gap-5 grid grid-cols-2">
                                    <div>
                                        <label>Youth (18-60):</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="subscription_costs.youth"
                                            value={fundSettings.subscription_costs.youth}
                                            placeholder="Set Youth fee" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Children (17 or less):</label>
                                        <input type="number" min={0}
                                            name="subscription_costs.children"
                                            onChange={handleChange}
                                            value={fundSettings.subscription_costs.children}
                                            placeholder="Set Children fee" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Elders (61+):</label>
                                        <input type="number" min={0}
                                            name="subscription_costs.elders"
                                            onChange={handleChange}
                                            value={fundSettings.subscription_costs.elders}
                                            placeholder="Set Elders fee" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                </div>
                            </section>
                            <section className="mt-5">
                                <h2 className="text-lg font-semibold text-white">4. Fund benefits</h2>
                                <div className="gap-5 grid grid-cols-2">
                                    <div>
                                        <label>Principal:</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="fund_benefits.principal"
                                            value={fundSettings.fund_benefits.principal}
                                            placeholder="Benefit amount for Principal" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Spouse:</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="fund_benefits.spouse"
                                            value={fundSettings.fund_benefits.spouse}
                                            placeholder="Benefit amount for Spouse" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Children:</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="fund_benefits.children"
                                            value={fundSettings.fund_benefits.children}
                                            placeholder="Benefit amount for Children" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Parents:</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="fund_benefits.parents"
                                            value={fundSettings.fund_benefits.parents}
                                            placeholder="Benefit amount for Parents" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                    <div>
                                        <label>Other (Guardians or close friends):</label>
                                        <input type="number" min={0}
                                            onChange={handleChange}
                                            name="fund_benefits.other"
                                            value={fundSettings.fund_benefits.other}
                                            placeholder="Benefit amount for Other" className="w-full p-2 border border-gray-300 rounded-md text-black text-right" />
                                    </div>
                                </div>
                            </section>

                            <section className="mt-5">
                                <h2 className="text-lg font-semibold text-white">5. Incident contribution fee</h2>
                                <label className="block text-sm font-medium text-neutral-300">Set contribution fee per incident:</label>
                                <input
                                    type="number" min={0}
                                    onChange={handleChange}
                                    name="incident_contribution_fee"
                                    value={fundSettings.incident_contribution_fee}
                                    placeholder="Enter incident contribution fee"
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black text-right"
                                />
                            </section>

                            <section className="mt-5 w-full">
                                <h2 className="text-lg font-semibold text-white">6. In-kind support</h2>
                                <label className="block text-sm font-medium text-neutral-300">In-kind support description:</label>
                                <textarea
                                    onChange={handleChange}
                                    name="in_kind_support"
                                    value={fundSettings.in_kind_support}
                                    placeholder="Describe in-kind support options..."
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md text-black"
                                ></textarea>
                                {
                                    isLoading ? <LoadingButton /> : (
                                        <div className="w-full flex items-center gap-2 mt-5 ">
                                            <Button onClick={handleSubmit} className="bg-blue-500 w-full justify-self-start">Save</Button>
                                            <Button onClick={() => setIsEditing(false)} className="bg-gray-500 w-full mt-2 justify-self-start">Cancel</Button>
                                        </div>
                                    )
                                }
                            </section>
                        </>
                    ) : (
                        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-white mb-4">Fund Settings Overview</h2>
                            <div className="flex flex-col gap-2 items-start justify-start">
                                <p>
                                    wallet: {groupBF?.walletAddress}
                                </p> <p>
                                    Deposited funds: 0 UGX
                                </p>
                                <p>
                                    Deposited funds by you: 0 UGX
                                </p>
                                <Button
                                    onClick={() => setPayForm(prev => ({ ...prev, open: true }))}
                                    className="bg-blue-500">
                                    Deposit funds
                                </Button>
                                {
                                    payForm.open && (
                                        <div className="flex flex-col gap-2 ">
                                            <Input
                                                className="text-black border-2 border-blue-500"
                                                type="text"
                                                name="amount"
                                                placeholder="Enter amount to deposit"
                                                value={payForm.data.amount}
                                                onChange={(e) => {
                                                    const input = e.target.value;
                                                    if (/^\d*$/.test(input)) { // Allows only digits
                                                        setPayForm(prev => ({ ...prev, data: { ...prev.data, amount: input } }));
                                                    }
                                                }}
                                            />

                                            <div className="w-full flex cursor-pointer border-2 border-blue-500 rounded-md">
                                                <select
                                                    className="text-black rounded-l-md pl-3"
                                                    defaultValue={"+256"}
                                                    value={payForm.data.countryCode}
                                                    onChange={handleCountryCodeChange}
                                                >
                                                    {countryCodes.map((country) => (
                                                        <option key={country.code} value={country.code}>
                                                            {country.label} ({country.code})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    className="text-black p-2 rounded-r w-full"
                                                    type="text"
                                                    name="phone"
                                                    maxLength={9}
                                                    placeholder="Enter mobile phone number"
                                                    value={payForm.data.phone}
                                                    onChange={(e) => {
                                                        const input = e.target.value;
                                                        if (/^\d*$/.test(input)) { // Allows only digits
                                                            setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: input } }));
                                                        }
                                                    }}
                                                />

                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    disabled={payForm.data.amount === "" || payForm.data.amount !== "0" || payForm.data.phone === ""}
                                                    onClick={makePayment}
                                                    className="bg-blue-500">
                                                    Confirm
                                                </Button>
                                                <Button
                                                    onClick={() => setPayForm({ open: false, data: { amount: "", phone: "", countryCode: countryCodes[0].code } })}
                                                    className="bg-transparent border-orange-500 border text-orange-500">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-white mt-5">
                                <div>
                                    <h3 className="font-semibold text-lg">Number of Beneficiaries per Principal</h3>
                                    <p>Minimum: {fundSettings.minBeneficiaries}</p>
                                    <p>Maximum: {fundSettings.maxBeneficiaries}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Membership Fee</h3>
                                    <p>{fundSettings.membership_fee} UGX</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Subscription Costs</h3>
                                    <p>Youth: {fundSettings.subscription_costs.youth} UGX</p>
                                    <p>Children: {fundSettings.subscription_costs.children} UGX</p>
                                    <p>Elders: {fundSettings.subscription_costs.elders} UGX</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Fund Benefits</h3>
                                    <p>Principal: {fundSettings.fund_benefits.principal} UGX</p>
                                    <p>Spouse: {fundSettings.fund_benefits.spouse} UGX</p>
                                    <p>Children: {fundSettings.fund_benefits.children} UGX</p>
                                    <p>Parents: {fundSettings.fund_benefits.parents} UGX</p>
                                    <p>Other: {fundSettings.fund_benefits.other} UGX</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Incident Contribution Fee</h3>
                                    <p>{fundSettings.incident_contribution_fee} UGX</p>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <h3 className="font-semibold text-lg">In-Kind Support</h3>
                                    <p>{fundSettings.in_kind_support || ""}</p>
                                </div>
                            </div>
                            {
                                ['admin', 'manager', 'hr', 'supervisor'].find(role => groupBF?.role?.includes(role)) &&
                                <Button onClick={() => setIsEditing(true)} className="bg-blue-500 mt-6">Edit Settings</Button>
                            }
                        </div>
                    )
                }

                <section className="mt-5">
                    {
                        ['admin', 'manager', 'hr', 'supervisor'].find(role => groupBF?.role?.includes(role)) && (
                            <div className="p-2 flex items-center justify-between w-full">
                                <h2 className="text-lg font-semibold text-white">7. Add officers</h2>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button className="bg-orange-500">
                                            Add new member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white max-h-[400px] overflow-auto">
                                        <DialogHeader className='flex flex-col'>
                                            <h1>
                                                Add new members to your bereavement fund
                                            </h1>
                                            <Input
                                                value={groupQuery}
                                                onChange={(e) => setGroupQuery(e.target.value)}
                                                type='text'
                                                placeholder={`Search among the group members to enroll new officers ...`}
                                            />
                                        </DialogHeader>
                                        <div className="mt-5">
                                            <div className='mt-5 w-full flex flex-col gap-2 '>
                                                {
                                                    filteredGroupMembers?.map((member) => {
                                                        if (member?._id === currentUser?._id) return null
                                                        if (newBfMembers && newBfMembers?.find(bfMember => bfMember.user._id === member?._id)!) return null
                                                        return (
                                                            <div className="w-full flex items-center gap-2">
                                                                <GroupMemberItem {...member} />
                                                                <Popover>
                                                                    <PopoverTrigger>
                                                                        <Button className="bg-blue-500 text-white">Add as ...</Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="bg-blue-400 flex flex-col gap-1 w-auto">
                                                                        {roles.current.map((role, index) => (

                                                                            <span
                                                                                className="cursor-pointer p-2 rounded-md w-full text-white hover:bg-white hover:text-blue-500"
                                                                                key={index}
                                                                                onClick={async () => {
                                                                                    const { bfMember, status } = await addBfMember({
                                                                                        bf_id: groupBF?._id!,
                                                                                        role,
                                                                                        user: member,
                                                                                        setBfMembers: setNewBfMembers
                                                                                    });

                                                                                    status && setNewBfMembers((prev: any) => ([...prev, { ...bfMember, user: member, createdAt: new Date() }]))
                                                                                }}
                                                                            >
                                                                                {role}
                                                                            </span>

                                                                        ))}
                                                                    </PopoverContent>
                                                                </Popover>

                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>

                                    </DialogContent>
                                </Dialog>
                            </div>
                        )

                    }

                    <div
                        key={newBfMembers?.length!}

                        className="mt-5 flex flex-col gap-2 max-h-[300px] overflow-auto"
                    >
                        <Input
                            onChange={(e) => setBfQuery(e.target.value)}
                            value={bfQuery}
                            type='text'
                            className="text-neutral-700 mb-5"
                            placeholder={`Search Bereavement fund officers ...`}
                        />
                        {
                            newBfMembers?.length ? filteredBfMembers?.map((member) => {

                                return (
                                    <div className="w-full flex items-center gap-2 justify-between">
                                        <div className="flex items-center justify-normal gap-1 relative w-full">
                                            <Avatar>
                                                <AvatarImage src={member.user.profile_pic} className="bg-black" />
                                                <AvatarFallback>{iconTextGenerator(member?.user.firstName as string, member?.user.lastName as string)}</AvatarFallback>
                                            </Avatar>
                                            <h1 className='text-[.8rem]'>{member.user.firstName} {member.user.lastName}</h1>

                                        </div>

                                        <Select
                                            disabled={member.user?._id === currentUser?._id || !['admin', 'manager'].find(role => groupBF?.role?.includes(role))}
                                            defaultValue={member?.role[0]}
                                            onValueChange={(v) => updateUserRole(member.user?._id!, v, groupBF?._id!)}
                                        >
                                            <SelectTrigger className="w-auto">
                                                <SelectValue placeholder={"Change role"} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white w-auto">
                                                {roles.current.map((role, index) => (

                                                    <SelectItem
                                                        className="cursor-pointer hover:bg-neutral-50"
                                                        key={index}
                                                        value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )
                            }) : ('no members')
                        }
                    </div>
                </section>

                {
                    ['admin', 'manager', 'hr', 'supervisor'].find(role => groupBF?.role?.includes(role)) && (
                        <section className="mt-5">
                            <div className="p-2 flex items-start w-fulls flex-col max-h-[300px] overflow-auto">
                                <h2 className="text-lg font-semibold text-white text-left">4. Available join requests</h2>

                                {
                                    bfJoinRequests?.length ? bfJoinRequests?.map((request) => {
                                        if (newBfMembers && newBfMembers.find(bfMember => bfMember?.user?._id === request.user?._id!)) return null
                                        return (
                                            <div className="w-full flex items-center gap-2">
                                                <GroupMemberItem {...request.user} />
                                                <Button
                                                    onClick={async () => {
                                                        const { status, newMember } = await acceptRequest({ userId: request?.user?._id!, bf_id: request.bf_id!, requestId: request._id! })
                                                        status && setNewBfMembers((prev: any) => ([...prev.filter((prevMember: any) => prevMember?._id === newMember?._id), { ...newMember, user: request?.user, createdAt: new Date() }]))
                                                    }}
                                                    className="bg-blue-500 text-white">Accept</Button>
                                                <Button
                                                    onClick={async () => {
                                                        const { status } = await declineRequest(request?._id!)
                                                        status && setNewBfMembers((prev: any) => ([...prev.filter((prevMember: any) => prevMember?.user._id === request.user?._id)]))
                                                    }}
                                                    className="bg-orange-500"
                                                >Decline</Button>
                                            </div>
                                        )
                                    }) : ('no other requests')
                                }
                            </div>
                        </section>
                    )
                }

                <section className="mt-5">
                    <div className="p-2 flex items-start w-full flex-col max-h-[500px] overflow-auto">
                        <h2 className="text-lg font-semibold text-white text-left">5. Filed cases</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <Button className="bg-transparent text-white border">
                                filter
                            </Button>
                            <Dialog open={dialogOpen}>
                                {
                                    (groupBF?.role && groupBF?.role?.includes('principal')) && (
                                        <DialogTrigger>
                                            <Button onClick={() => setDialogOpen(true)} className="bg-blue-500 text-white">
                                                file a case
                                            </Button>
                                        </DialogTrigger>
                                    )
                                }
                                <DialogContent
                                    className="w-full bg-white"
                                >
                                    <DialogHeader>
                                        File a new case
                                    </DialogHeader>
                                    <div className="p-4 rounded-md shadow-md w-full">
                                        <h3 className="text-xl font-bold text-white mb-4">File a New Case</h3>
                                        <form>
                                            {/* Name Input */}
                                            <div className="mb-4">
                                                <label htmlFor="name" className="block text-sm font-medium ">Case Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                                                    name="name"
                                                    className="mt-1 p-2 w-full border border-gray-700 rounded "
                                                    placeholder="Enter case name"
                                                    required
                                                />
                                            </div>

                                            {/* Description Input */}
                                            <div className="mb-4">
                                                <label htmlFor="description" className="block text-sm font-medium ">Description</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    className="mt-1 p-2 w-full border border-gray-700 rounded-md"
                                                    onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Enter case description"
                                                    rows={3}
                                                    required
                                                ></textarea>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex items-center gap-3 mt-3">

                                                <button
                                                    disabled={isLoading}
                                                    onClick={async (e) => {
                                                        setIsLoading(true)
                                                        e.preventDefault()
                                                        const { status, case: returnedCase } = await fileCase(groupBF?._id!, newCase)
                                                        setIsLoading(false)
                                                        if (status) {
                                                            setCases(prev => [...prev, returnedCase])
                                                            setDialogOpen(false)
                                                        }
                                                    }}
                                                    type="submit"
                                                    className="w-full bg-blue-600 disabled:cursor-pointer-allowed hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-2"
                                                >
                                                    Submit Case
                                                </button>

                                                <button
                                                    className="w-full bg-transparent border border-orange-500 text-orange font-semibold py-2 px-4 rounded mt-2"
                                                    onClick={() => setDialogOpen(false)}
                                                >

                                                    cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4 w-full mt-5">
                            {
                                cases.length ? (
                                    cases.map((caseItem: Case) => {
                                        return (
                                            <div className="bg-gray-800 p-3 rounded-md" key={caseItem._id}>
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {caseItem.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2">
                                                    {caseItem.description.length > 100
                                                        ? `${caseItem.description.slice(0, 100)}...`
                                                        : caseItem.description}
                                                </p>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm">
                                                        <span className="font-semibold ">Status:</span>
                                                        <span className={`ml-1 text-${caseItem.status === 'Open' ? 'green-400' : 'red-400'}`}>
                                                            {caseItem.status}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-semibold ">Contribution status:</span>
                                                        <span className={`ml-1 ${caseItem.contributionStatus === 'Complete' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {caseItem.contributionStatus}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        <span className="font-semibold ">File on:</span> {moment(caseItem.createdAt).format('LL')}
                                                    </p>
                                                </div>
                                                <div className='w-full flex gap-2 mt-2'>
                                                    <Dialog>
                                                        <DialogTrigger className="w-1/2">
                                                            <Button className="bg-green-500 text-white w-full">contribute</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-full bg-white p-6 rounded-lg">
                                                            <DialogHeader className="text-xl font-bold mb-4">Make a Contribution</DialogHeader>
                                                            <div className="mb-4">
                                                                <Input
                                                                    className="text-black border-2 border-blue-500"
                                                                    type="text"
                                                                    name="amount"
                                                                    placeholder="Enter amount to deposit"
                                                                    value={payForm.data.amount}
                                                                    onChange={(e) => {
                                                                        const input = e.target.value;
                                                                        if (/^\d*$/.test(input)) { // Allows only digits
                                                                            setPayForm(prev => ({ ...prev, data: { ...prev.data, amount: input } }));
                                                                        }
                                                                    }}
                                                                />

                                                                <div className="w-full flex cursor-pointer mt-3">
                                                                    <select
                                                                        className="text-black border border-gray-300 rounded-l p-2"
                                                                        value={payForm.data.countryCode}
                                                                        onChange={handleCountryCodeChange}
                                                                    >
                                                                        {countryCodes.map((country) => (
                                                                            <option key={country.code} value={country.code}>
                                                                                {country.label} ({country.code})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <input
                                                                        className="text-black p-2 rounded-r w-full"
                                                                        type="text"
                                                                        name="phone"
                                                                        maxLength={9}
                                                                        placeholder="Enter mobile phone number"
                                                                        value={payForm.data.phone}
                                                                        onChange={(e) => {
                                                                            const input = e.target.value;
                                                                            if (/^\d*$/.test(input)) { // Allows only digits
                                                                                setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: input } }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 mt-3">
                                                                <DialogClose>
                                                                    <Button
                                                                        // disabled={payForm.data.amount === 0 || payForm.data.phone === ""}
                                                                        onClick={makePayment}
                                                                        className="bg-blue-500 text-white disabled:cursor-not-allowed">
                                                                        Confirm
                                                                    </Button>
                                                                </DialogClose>
                                                                <DialogClose>
                                                                    <Button
                                                                        onClick={() => setPayForm({ open: false, data: { amount: "", phone: "", countryCode: countryCodes[0].code } })}
                                                                        className="bg-transparent border-orange-500 border text-orange-500">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger className="w-1/2">
                                                            <Button className="bg-blue-500 text-white w-full">more</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-full bg-white p-6 rounded-lg">
                                                            <DialogHeader className="text-xl font-bold mb-4">Case Details</DialogHeader>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <span className="font-semibold">Name:</span> {caseItem.name}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <span className="font-semibold">Created by:</span> {caseItem.principal.firstName} {caseItem.principal.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <span className="font-semibold">Description:</span> {caseItem.description}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <span className="font-semibold">Filed on:</span> {moment(caseItem.createdAt).format('LL')}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-4">
                                                                <Button
                                                                    onClick={async () => {
                                                                        const { status, case: updatedCase} = await updateCase(caseItem._id, { status: caseItem.status === 'Open' ? 'Closed' : 'Open' })
                                                                        if(status){
                                                                            setCases(prev=>prev.map(prevCase=>prevCase?._id === caseItem?._id? {...updatedCase, status: caseItem.status === 'Open' ? 'Closed' : 'Open' }: {...caseItem}))
                                                                        }
                                                                    }}  
                                                                    className={`text-white px-4 py-2 rounded ${caseItem.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                                    Mark as {caseItem.status === 'Open' ? 'Closed' : 'Open'}
                                                                </Button>
                                                                <Button
                                                                    onClick={async () => {
                                                                        const { status,  case: updatedCase} = await updateCase(caseItem._id, {contributionStatus: caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete' })
                                                                        if(status){
                                                                            setCases(prev=>prev.map(prevCase=>prevCase?._id === caseItem?._id? {...updatedCase, contributionStatus: caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete' }: {...caseItem}))
                                                                        }
                                                                    }}
                                                                    className={`text-white px-4 py-2 rounded ${caseItem.contributionStatus === 'Complete' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                                    Mark Contribution {caseItem.contributionStatus === 'Complete' ? 'Incomplete' : 'Complete'}
                                                                </Button>
                                                            </div>
                                                            <DialogClose>
                                                                <Button className="mt-6 bg-gray-500 text-white px-4 py-2 rounded w-full">
                                                                    Close
                                                                </Button>
                                                            </DialogClose>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-white col-span-3 text-center">No cases available</p>
                                )
                            }
                        </div>
                    </div>
                </section>

            </div>
        );
    }
}

export default FundSettingsPage;
