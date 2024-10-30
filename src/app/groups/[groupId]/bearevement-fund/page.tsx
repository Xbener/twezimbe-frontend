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
import { addBfMember, updateUserRole } from '@/lib/bf';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetProfileData } from '@/api/auth';
type Beneficiary = {
    name: string;
    id: number;
}

type FundSettingsPageProps = {}

const FundSettingsPage: React.FC<FundSettingsPageProps> = () => {
    const { group, groupBF, setPrivateChannelMembers, bfMembers, setBfMembers, bfMembersRef, bfJoinRequests } = useContext(GroupContext);

    const [minBeneficiaries, setMinBeneficiaries] = useState<number>(1);
    const [maxBeneficiaries, setMaxBeneficiaries] = useState<number>(5);
    const [contributionAmount, setContributionAmount] = useState<number>(0);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
    const [isLoading, setIsLoading] = useState(false)
    const { currentUser } = useGetProfileData()
    const [newBfMembers, setNewBfMembers] = useState(bfMembers)
    const [allMembers, setAllMembers] = useState(group?.members)

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
        'beneficiary'
    ])

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

            <section className="mt-5">
                <div className="p-2 flex items-center justify-between w-full">
                    <h2 className="text-lg font-semibold text-white">2. Change role</h2>
                    <Dialog>
                        <DialogTrigger>
                            <Button className="bg-orange-500">
                                Add new member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                            <DialogHeader>
                                Add new members to your Bearevement fund
                            </DialogHeader>
                            <div className="mt-5">
                                <div className='mt-5 w-full flex flex-col gap-2 '>
                                    {
                                        group?.members?.map((member) => {
                                            if (member?._id === currentUser?._id) return null
                                            return (
                                                <div className="w-full flex items-center gap-2">
                                                    <GroupMemberItem {...member} />
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <Button className="bg-blue-500 text-white">Add as ...</Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="bg-blue-400 flex flex-col gap-1">
                                                            {roles.current.map((role, index) => (

                                                                <span
                                                                    className="cursor-pointer p-2 rounded-md w-full text-white hover:bg-white hover:text-blue-500"
                                                                    key={index}
                                                                    onClick={async () => {
                                                                        const { newMember, status } = await addBfMember({
                                                                            bf_id: groupBF?._id!,
                                                                            role,
                                                                            user: member,
                                                                            setBfMembers: setNewBfMembers
                                                                        });

                                                                        status && setNewBfMembers((prev: any) => ([...prev.filter((prevMember: any) => prevMember?._id === newMember?._id), { ...newMember, user: member, role, createdAt: new Date() }]))
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

                <div
                    key={newBfMembers?.length!}
                    className="mt-5 flex flex-col gap-2 max-h-[300px] overflow-auto"
                >
                    {
                        newBfMembers?.length ? newBfMembers?.map((member) => {

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
                                        disabled={member?._id === currentUser?._id}
                                        defaultValue={member?.role}
                                        onValueChange={(v) => updateUserRole(member.user?._id!, v, groupBF?._id!)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={"Change role"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
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

            <section className="mt-5">
                <div className="p-2 flex items-start w-fulls flex-col max-h-[300px] overflow-auto">
                    <h2 className="text-lg font-semibold text-white text-left">3. Enroll principal</h2>

                    {
                        allMembers?.length ? allMembers?.map((member) => {
                            if (member?._id === currentUser?._id) return null
                            if (newBfMembers && newBfMembers?.find(bfMember => bfMember?.user?._id === member._id)) return null
                            return (
                                <div className="w-full flex items-center gap-2">
                                    <GroupMemberItem {...member} />
                                    <Button
                                        onClick={async () => {
                                            const { newMember, status } = await addBfMember({
                                                bf_id: groupBF?._id!,
                                                role: 'principal',
                                                user: member,
                                                setBfMembers: setNewBfMembers
                                            });

                                            status && setNewBfMembers((prev: any) => ([...prev.filter((prevMember: any) => prevMember?._id === newMember?._id), { ...newMember, user: member, role: 'principal', createdAt: new Date() }]))
                                        }}
                                        className="bg-blue-500 text-white">Invite</Button>
                                </div>
                            )
                        }) : ('no other members')
                    }

                </div>
            </section>

            <section className="mt-5">
                <div className="p-2 flex items-start w-fulls flex-col max-h-[300px] overflow-auto">
                    <h2 className="text-lg font-semibold text-white text-left">4. Available Join requests</h2>

                    {
                        bfJoinRequests?.length ? bfJoinRequests?.map((request) => {
                            return (
                                <div className="w-full flex items-center gap-2">
                                    <GroupMemberItem {...request.user} />
                                    <Button
                                        className="bg-blue-500 text-white">Accept</Button>
                                        <Button
                                        className="bg-orange-500"
                                        >Decline</Button>
                                </div>
                            )
                        }) : ('no other requests')
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
