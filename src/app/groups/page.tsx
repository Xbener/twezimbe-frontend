'use client'

import { useGetProfileData } from '@/api/auth';
import { useGetGroupList, useJoinGroup } from '@/api/group';
import { Button } from '@/components/ui/button';
import { GroupTypes } from '@/types';
import { EyeClosedIcon } from '@radix-ui/react-icons';
import { Eye, Home, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'sonner';
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { socket } from '@/context/MyContext';

type Props = {};

const categoryList = [
  { name: "Social", link: "Social" },
  { name: "Educational", link: "Educational" },
  { name: "Professional", link: "Professional" },
  { name: "Others", link: "Others" },
];

function Groups({ }: Props) {
  const { groups, isLoading } = useGetGroupList();
  const { currentUser } = useGetProfileData();
  const { joinGroup, isLoading: joinLoading, isError: joinError } = useJoinGroup();

  const [formattedGroups, setFormattedGroups] = useState<GroupTypes[]>(groups);
  const [filteredGroups, setFilteredGroups] = useState<GroupTypes[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'All') queryParams.set('category', selectedCategory);

    const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : '';
    router.replace(newUrl);  // Update the URL without reloading
  }, [searchQuery, selectedCategory, router]);


  useEffect(() => {
    setFormattedGroups(groups);
  }, [groups]);

  useEffect(() => {
    filterGroups();
  }, [formattedGroups, searchQuery, selectedCategory]);

  const filterGroups = () => {
    let filtered = formattedGroups;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(group =>
        group.group_type === selectedCategory
      );
    }

    setFilteredGroups(filtered);
  };

  const joinPublicGroup = async (group: GroupTypes) => {
    try {
      if (!currentUser?.is_complete && group?.isSacco) return toast.error("Complete your profile first to join.");
      const res = await joinGroup({ user_id: currentUser?._id, group_id: group?._id });

      if (res._id !== null) {
        socket.emit("new-group-join", ({ receiver: group.members, joined_user: currentUser }))
        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${group?._id}`;
      } else {
        toast.error(res.message || res.errors);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again");
    }
  };

  const sendRequestToJoin = async (group: GroupTypes) => {
    try {
      const accessToken = Cookies.get('access-token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ groupId: group?._id, userId: currentUser?._id })
      });
      const data = await res.json();

      if (data.status) {
        toast.success('Request sent successfully. Wait for approval from admins');
        setFormattedGroups(prev => prev?.filter(prevGroup => prevGroup?._id !== group._id));
      } else { 
        toast.error(data.errors || data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again");
    }
  };

  return (
    <div className='flex flex-col w-full h-screen overflow-hidden'>
      {/* Sticky Header */}
      <div className='w-full bg-[#202234] text-neutral-200 sticky top-0 left-0 z-20'>
        <div className='flex flex-col sm:flex-row items-center justify-between p-5 w-full gap-3'>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger className="flex lg:hidden">
                <Menu />
              </PopoverTrigger>

              <PopoverContent className='bg-blue-500 shadow-lg'>
                <ul className='gap-3 flex-col flex items-start justify-normal'>
                  {
                    categoryList.map((category, index) => (
                      <li key={index} className='w-full block '>
                        <button
                          className={`${selectedCategory === category.link ? '' : ''} p-2 w-full rounded-md hover:bg-gray-200 hover:text-black text-white duration-200`}
                          onClick={() => setSelectedCategory(category.link)}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))
                  }
                </ul>

              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 cursor-pointer">
              <span onClick={()=>router.push('/')}><Home /></span>
              <h1 className='text-[2rem] font-bold'>Discover</h1>
            </div>
          </div>

          {/* Category Menu */}
          <ul className='hidden gap-3 flex-wrap lg:flex'>
            {
              categoryList.map((category, index) => (
                <li key={index} className='w-full sm:w-auto'>
                  <button
                    className={`${selectedCategory === category.link ? '' : ''} p-2 text-sm sm:text-base  rounded-md hover:bg-gray-200 hover:text-black duration-200`}
                    onClick={() => setSelectedCategory(category.link)}
                  >
                    {category.name}
                  </button>
                </li>
              ))
            }
          </ul>

          {/* Search Input */}
          <div className="flex items-center bg-gray-200 p-2 rounded-full text-neutral-700">
            <input
              className='bg-transparent outline-none'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search ...'
            />
            <Search />
          </div>
        </div>
      </div>

      <div className='h-full overflow-auto flex flex-col'>
        <div className='flex flex-col bg-[#202234] p-5 text-neutral-200'>
          <h1 className="sm:text-[4rem] text-[1rem] font-bold">Join a community. Network.</h1>
          <p>Join or Form a Social, Educational, Professional or any group and connect</p>
        </div>

        <div className="mt-5">
          <h1 className='p-5 text-[2rem] text-neutral-800'>Browse Groups</h1>

          {/* Loading State */}
          {isLoading && (
            <Skeleton
              containerClassName='flex gap-4'
              inline height={300} count={5} className='h-[300px] sm:w-[45%] md:w-[30%] lg:w-[23%]'
            />
          )}

          {/* No Groups Found */}
          {formattedGroups && filteredGroups?.length! <= 0 && (
            <div className='w-full p-5 grid place-content-center'>
              <h1>No Groups Found</h1>
            </div>
          )}

          {/* Group List */}
          <div className='flex p-5 mt-5 items-start justify-start gap-5 flex-wrap w-full'>
            {
              filteredGroups?.map((group: GroupTypes, key) => (
                <div
                  key={key}
                  className='flex flex-col p-5 bg-[#66acee39] h-[300px] shadow-lg rounded-md sm:w-[45%] md:w-[30%] lg:w-[23%] gap-3 overflow-hidden'
                >
                  {/* Image Placeholder */}
                  <div className='h-[100px] w-full bg-gray-300 mb-3'>

                    <img
                      src={group.group_picture || 'https://res.cloudinary.com/djehh7gum/image/upload/v1729070790/ura0gnomuhpti7sbi79r.png'}
                      className="w-full h-[100px] object-cover"
                    />
                  </div>

                  {/* Content */}
                  <h1 className='flex-grow flex items-center gap-2'>
                    {group.group_name} {group.group_state === 'Public' ? <Eye /> : <EyeClosedIcon />}
                  </h1>
                  <p className='flex-grow'>
                    {group.description.length < 30 ? group.description : `${group.description.substring(0, 30)} ...`}
                  </p>
                  <p>{group.memberCount} {group.memberCount > 1 ? "members" : 'member'}</p>

                  {/* Join/Request Button */}
                  <Button
                    className='w-full px-5 py-2 rounded-md bg-[#013a6f] text-white mt-auto'
                    onClick={() => group.group_state === "Public" ? joinPublicGroup(group) : sendRequestToJoin(group)}
                  >
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
