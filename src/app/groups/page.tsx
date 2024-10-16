'use client'

import { useGetProfileData } from '@/api/auth';
import { useGetGroupList, useJoinGroup } from '@/api/group';
import { GroupTypes } from '@/types';
import { EyeClosedIcon } from '@radix-ui/react-icons';
import { Eye, Search } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {};

const categoryList = [
  { name: "Social", link: "" },
  { name: "Educational", link: "" },
  { name: "Professional", link: "" },
  { name: "Others", link: "" },
];

function Groups({ }: Props) {
  const { groups, isLoading } = useGetGroupList()
  const { currentUser } = useGetProfileData()
  const { joinGroup } = useJoinGroup()
  const [formattedGroups, setFormattedGroups] = useState(groups)

  useEffect(() => {
    setFormattedGroups(groups)
  }, [groups])


  const joinPublicGroup = async (group: GroupTypes) => {
    try {
      const res = await joinGroup({ user_id: currentUser?._id, group_id: group?._id })

      console.log('res', res)
      if (res._id !== null) {
        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${group?._id}`
      }
    } catch (error) {
      toast.error("An error occurred. Please try again")
    }
  }


  const sendRequestToJoin = async (group: GroupTypes) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ group_id: group?._id })
      })
      const data = await res.json()

      if (data.status) {
        toast.success('request sent successfully')
        setFormattedGroups(prev => {
          return prev?.filter(prevGroup => prevGroup?._id === group._id)
        })
      }
    } catch (error) {
      toast.error("An error occurred. Please try again")
    }
  }
  return (
    <div className='flex flex-col w-full h-screen overflow-hidden'>
      {/* Sticky Header */}
      <div className='w-full bg-[#202234] text-neutral-200 sticky top-0 left-0 z-20'>
        <div className='flex items-center justify-between p-5 w-full'>
          <h1 className='text-[2rem] font-bold'>Discover</h1>
          <ul className='flex gap-3'>
            {
              categoryList.map((category, index) => (
                <Link key={index} href={category.link}>
                  {category.name}
                </Link>
              ))
            }
          </ul>

          <div className="flex items-center bg-gray-200 p-2 text-neutral-700">
            <input className='bg-transparent outline-none' placeholder='Search ...' />
            <Search />
          </div>
        </div>
      </div>

      <div className='h-full overflow-auto flex flex-col'>
        <div className='flex flex-col bg-[#202234] p-5 text-neutral-200'>
          <h1 className="text-[4rem] uppercase font-bold">Find Your Community</h1>
          <p>From Social, Educational, Professional, and many more!</p>
        </div>

        <div className="mt-5">

          <h1 className='p-5 text-[2rem] text-neutral-800'>Public Groups</h1>
          {
            isLoading && "Loading ..."
          }
          <div className='flex p-5 mt-5 items-start justify-start gap-5 flex-wrap w-full'>
            {
              formattedGroups?.map((group, key) => (
                <div
                  key={key}
                  className='flex flex-col p-5 bg-[#66acee39] h-[300px] shadow-lg rounded-md sm:w-[45%] md:w-[30%] lg:w-[23%] gap-3'
                >
                  {/* Image Placeholder */}
                  <div className='h-[100px] w-full bg-gray-300 mb-3'>
                    <img
                      src={group.group_picture}
                      className="w-full h-[100px] object-cover"
                    />
                  </div>

                  {/* Content */}
                  <h1 className='flex-grow flex items-center gap-2'>{group.group_name} {group.group_state === 'Public' ? <Eye /> : <EyeClosedIcon />}</h1>
                  <p className='flex-grow'>{group.description}</p>
                  <p>{group.memberCount} {group.memberCount > 1 ? "members" : 'member'}</p>
                  {/* Link Button */}
                  <Link href={`/groups/[id]`} onClick={() => {
                    group.group_state === "Public" ? joinPublicGroup(group) : sendRequestToJoin(group)
                  }} as={`/groups/${group._id}`}>
                    <button className='px-5 py-2 rounded-md bg-[#013a6f] text-white mt-auto'>
                      {group.group_state === "Public" ? "Join Group" : "Request To join"}
                    </button>
                  </Link>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;
