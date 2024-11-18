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
import { acceptRequest, addBfMember, declineRequest, fileCase, getCases, updateUserRole, updateCase, updateWalletBalance } from '@/lib/bf';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetProfileData } from '@/api/auth';
import { Case, FundSettings } from '@/types';
import { useRouter } from 'next/navigation';
import { XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { countryCodes } from '@/constants';
import moment from 'moment'
import { makePayment } from '@/utils/makePayment';
import { formatWithCommas } from '@/utils/formatNumber';

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
            phone: currentUser?.phone,
            countryCode: countryCodes[0].code
        }
    })
    useEffect(() => {
        setPayForm(prev => ({ ...prev, data: { ...prev.data, phone: currentUser?.phone } }))
    }, [currentUser])
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
                e.target.value = formatWithCommas(rawValue);
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


    if (!fundSettings) return ("loading ...")
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 text-white mt-5">
                            <div>
                                <h3 className="font-semibold text-lg">Number of Beneficiaries per Principal</h3>
                                <p>Minimum: {fundSettings.minBeneficiaries}</p>
                                <p>Maximum: {fundSettings.maxBeneficiaries}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Membership Fee</h3>
                                <p>{formatWithCommas(fundSettings.membership_fee)} UGX</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Subscription Costs</h3>
                                <p>Youth: {formatWithCommas(fundSettings.subscription_costs.youth)} UGX</p>
                                <p>Children: {formatWithCommas(fundSettings.subscription_costs.children)} UGX</p>
                                <p>Elders: {formatWithCommas(fundSettings.subscription_costs.elders)} UGX</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Fund Benefits</h3>
                                <p>Principal: {formatWithCommas(fundSettings.fund_benefits.principal)} UGX</p>
                                <p>Spouse: {formatWithCommas(fundSettings.fund_benefits.spouse)} UGX</p>
                                <p>Children: {(formatWithCommas(fundSettings.fund_benefits.children))} UGX</p>
                                <p>Parents: {formatWithCommas(fundSettings.fund_benefits.parents)} UGX</p>
                                <p>Other: {formatWithCommas(fundSettings.fund_benefits.other)} UGX</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Incident Contribution Fee</h3>
                                <p>{formatWithCommas(fundSettings.incident_contribution_fee)} UGX</p>
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
                                        onValueChange={(v: string) => updateUserRole(member.user?._id!, v, groupBF?._id!)}
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



        </div>
    );
}

export default FundSettingsPage;
