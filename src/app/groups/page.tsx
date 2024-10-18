'use client'

import { useGetProfileData } from '@/api/auth';
import { useGetGroupList, useJoinGroup } from '@/api/group';
import { Button } from '@/components/ui/button';
import { GroupTypes } from '@/types';
import { EyeClosedIcon } from '@radix-ui/react-icons';
import { Eye, Search } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'sonner';
import Cookies from 'js-cookie'

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
  const { joinGroup, isLoading: joinLoading, isError: joinError } = useJoinGroup()
  const [formattedGroups, setFormattedGroups] = useState(groups)
  const [requestLoading, setRequestLoading] = useState(false)

  useEffect(() => {
    if (currentUser && !currentUser?.is_complete) {
      toast.error('Please complete your profile to join groups')
      const timeout = setTimeout(() => {
        window.location.href = '/public_pages/Profile'
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [currentUser])

  useEffect(() => {
    setFormattedGroups(groups)
  }, [groups])


  const joinPublicGroup = async (group: GroupTypes) => {
    try {
      if(!currentUser?.is_complete) return toast.error("Complete your profile first to join.")
      const res = await joinGroup({ user_id: currentUser?._id, group_id: group?._id })

      if (res._id !== null) {
        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${group?._id}`
      } else {
        toast.error(res.message || res.errors)
      }
    } catch (error) {
      toast.error("An error occurred. Please try again")
    }
  }


  const sendRequestToJoin = async (group: GroupTypes) => {
    try {
      setRequestLoading(true)
      const accessToken = Cookies.get('access-token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ groupId: group?._id, userId: currentUser?._id })
      })
      const data = await res.json()

      if (data.status) {
        toast.success('request sent successfully. Wait for approval from admins')
        setFormattedGroups(prev => {
          return prev?.filter(prevGroup => prevGroup?._id === group._id)
        })
      } else {
        toast.error(data.errors || data.message)
      }
    } catch (error) {
      toast.error("An error occurred. Please try again")
    } finally {
      setRequestLoading(false)
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

          <h1 className='p-5 text-[2rem] text-neutral-800'>Browse Groups</h1>
          {
            isLoading && <Skeleton
              containerClassName='flex gap-4'
              inline height={300} count={5} className='h-[300px sm:w-[45%] md:w-[30%] lg:w-[23%]' />
          }

          {
            formattedGroups?.length! <= 0 && (
              <div className='w-full p-5 grid place-content-center'>
                <h1>No Groups Found</h1>
              </div>
            )
          }
          <div className='flex p-5 mt-5 items-start justify-start gap-5 flex-wrap w-full'>
            {
              formattedGroups?.map((group: GroupTypes, key) => (
                <div
                  key={key}
                  className='flex flex-col p-5 bg-[#66acee39] h-[300px] shadow-lg rounded-md sm:w-[45%] md:w-[30%] lg:w-[23%] gap-3 overflow-hidden'
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
                  <p className='flex-grow'>
                    {group.description.length < 50 ? group.description : `${group.description.substring(0, 50)} ...`}
                  </p>
                  <p>{group.memberCount} {group.memberCount > 1 ? "members" : 'member'}</p>
                  {/* Link Button */}
                  <Button className='w-full px-5 py-2 rounded-md bg-[#013a6f] text-white mt-auto' disabled={requestLoading} onClick={() => {
                    group.group_state === "Public" ? joinPublicGroup(group) : sendRequestToJoin(group)
                  }}>
                    {group.group_state === "Public" ? "Join Group" : "Request To join"}
                  </Button>
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
