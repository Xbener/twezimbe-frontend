'use client'
import { useGetProfileData } from '@/api/auth'
import AgeGroupsBarChart from '@/components/charts/BarChart'
import { PieChartComponent } from '@/components/charts/PieChart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import GroupMemberItem from '@/components/groups/GroupMemberItem'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { GroupContext } from '@/context/GroupContext'
import { addBeneficiary, getBeneficiaries, getCases, removeBeneficiary } from '@/lib/bf'
import { Beneficiary, Case, MetaData, User } from '@/types'
import { formatWithCommas } from '@/utils/formatNumber'
import { LucideOrigami, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import PacmanLoader from 'react-spinners/PacmanLoader'

type Props = {}

function Page({ }: Props) {
    const { currentUser } = useGetProfileData()
    const { group, groupBF, bfMembers } = useContext(GroupContext)
    const [beneficiaryQuery, setBeneficiaryQuery] = useState('')
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    let [metadata, setMetadata] = useState<MetaData[] | null>(null)
    const [groupQuery, setGroupQuery] = useState('')
    const [topContributors, setTopContributors] = useState<{ name: string; amount: number }[]>([])
    const router = useRouter()
    const [cases, setCases] = useState<Case[]>([])
    const [ageGroupsData, setAgeGroupsData] = useState<{ ageGroup: string; count: number }[]>([])

    useEffect(() => {
        async function getData() {
            const beneficiaries = await getBeneficiaries(groupBF?._id!, currentUser?._id!)
            setBeneficiaries(beneficiaries || [])
            const { cases, status } = await getCases(groupBF?._id!)
            if (status) setCases(cases)
        }

        if (groupBF && currentUser) {
            getData()
        }
    }, [groupBF, currentUser])

    useEffect(() => {
        setMetadata([
            {
                title: "Total members",
                value: bfMembers?.length || 0
            },
            {
                title: "Balance",
                value: `${groupBF?.wallet?.balance ? formatWithCommas(groupBF?.wallet?.balance) : 0} UGX`
            },
            {
                title: "Total transactions",
                value: groupBF?.wallet?.transactionHistory.length || 0
            },
            {
                title: "Cases",
                value: cases.length || 0
            },
            {
                title: "Total contributions",
                value: groupBF?.contributions?.length || 0
            },
            {
                title: "Total beneficiaries",
                value: beneficiaries.length || 0
            }
        ])

    }, [
        group,
        groupBF,
        beneficiaries,
        cases
    ])

    useEffect(() => {
        if (bfMembers) {
            const now = new Date()
            const ageGroups = {
                'Below 18': 0,
                '18-30': 0,
                '31-50': 0,
                'Above 50': 0,
            }

            bfMembers.forEach((member) => {
                const birthday = new Date(member.user.birthday)
                const age = now.getFullYear() - birthday.getFullYear()
                const isBeforeBirthday =
                    now.getMonth() < birthday.getMonth() ||
                    (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate())

                const exactAge = isBeforeBirthday ? age - 1 : age

                if (exactAge < 18) ageGroups['Below 18'] += 1
                else if (exactAge >= 18 && exactAge <= 30) ageGroups['18-30'] += 1
                else if (exactAge >= 31 && exactAge <= 50) ageGroups['31-50'] += 1
                else ageGroups['Above 50'] += 1
            })

            // Transform `ageGroups` into an array of objects
            const ageGroupsArray = Object.entries(ageGroups).map(([ageGroup, count]) => ({
                ageGroup,
                count,
            }))

            setAgeGroupsData(ageGroupsArray)
        }
    }, [bfMembers])

    useEffect(() => {
        if (cases?.length) {
            const contributorMap: { [userId: string]: number } = {}

            // Aggregate contributions for each contributor
            cases.forEach((singleCase) => {
                singleCase.contributions?.forEach((contribution) => {
                    if (contribution.contributor.length) {
                        const contributorId = contribution.contributor[0]._id
                        if (!contributorMap[contributorId]) {
                            contributorMap[contributorId] = 0
                        }
                        contributorMap[contributorId] += contribution.amount
                    }
                })
            })

            const sortedContributors = Object.keys(contributorMap)
                .map((userId) => {
                    const contributorCase = cases.filter((c) => c.contributions?.filter(cont => `${cont.contributor._id}` === `${userId}`))[0]
                    const contributor = contributorCase?.contributions?.find((contribution) => contribution.contributor.length && contribution.contributor[0]._id === userId)?.contributor[0]
                    const name = contributor ? `${contributor.firstName} ${contributor.lastName}` : 'Unknown'

                    return {
                        name,
                        amount: contributorMap[userId],
                    }
                })
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5) // Get top 5 contributors

            setTopContributors(sortedContributors)
        }
    }, [cases])

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

    if (!currentUser) return (
        <div className='w-full h-[100dvh] grid place-content-center'>
            <PacmanLoader color='' />
        </div>
    )
    return (
        <div className='bg-neutral-100 text-neutral-700 min-h-full'>
            <div className='w-full p-2 flex justify-between border-b'>
                <div className='flex items-center gap-2'>
                    <LucideOrigami />
                    <h1 className='text-[1.2rem] font-bold'>
                        {currentUser?.firstName} {currentUser?.lastName}
                    </h1>
                </div>

                <div>
                    <Button
                        onClick={() => router.push(`/groups/${group?._id}/principal/settings`)}
                    >
                        <Settings />
                    </Button>
                </div>
            </div>

            <div className='w-full p-3 mt-5 flex flex-col items-start gap-2'>
                <div className='flex gap-2 w-full flex-wrap'>
                    {
                        metadata?.length ? metadata.map((card, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`flex-1 min-w-auto flex-col max-w-[15%] border border-white p-4 rounded-lg shadow-md flex justify-around  bg-white`}
                                >
                                    <div className="text-sm font-semibold ">{card.title}</div>
                                    <div className="text-[1.2rem] font-bold">{card.value}</div>
                                </div>
                            )
                        }) : null
                    }
                </div>

                <div className='w-full flex items-start justify-start gap-3 flex-col md:flex-row h-auto'>
                    <div className='bg-white rounded-md w-full md:w-1/2'>
                        <div className='shadow-md  h-[313px] overscroll-auto p-2'>
                            <div className="flex w-full justify-between items-center">
                                <h1 className='text-[1.2rem] mb-4 p-2 font-bold'>Your beneficiaries</h1>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button className='bg-blue-500 text-white'>
                                            Add beneficiary
                                        </Button>
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
                                                            <div key={member.id} className="w-full flex items-center gap-2">
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
                            {
                                beneficiaries?.map((member) => {

                                    return (
                                        <div key={member.beneficiary._id} className="w-full flex items-center gap-2">
                                            <GroupMemberItem {...member.beneficiary} />
                                            <Button
                                                className="bg-orange-500 text-white"
                                                onClick={async () => {
                                                    const { status } = await removeBeneficiary({ principalId: currentUser?._id!, userId: member.beneficiary._id!, bfId: groupBF?._id! })
                                                    setBeneficiaries(prev => {
                                                        return prev.filter(prev => prev.beneficiary._id !== member.beneficiary?._id)
                                                    })
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                    <div className="bg-white w-full md:w-1/2 p-2">
                        <div>
                            <AgeGroupsBarChart data={ageGroupsData} />
                        </div>
                    </div>
                </div>

                <div className="w-full flex items-start justify-start gap-3 flex-col md:flex-row h-auto">
                    <div className="w-full md:w-1/2 bg-white p-3">
                        <h1 className='text-lg font-bold text-center'>Top contributors (Currency: UGX)</h1>

                        <div className="w-full flex flex-col gap-2">
                            <PieChartComponent data={topContributors} />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 bg-white p-3">
                        <h1 className='text-lg font-bold text-center'>Cases status and contribution status</h1>

                        <div className="w-full flex flex-col gap-2">
                            <StackedBarChart cases={cases} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page