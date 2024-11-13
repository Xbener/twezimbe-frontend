'use client'

import { useGetProfileData } from '@/api/auth';
import { useGetAllGroups, useGetjoinedGroupList } from '@/api/group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GroupContext } from '@/context/GroupContext';
import { useMyContext } from '@/context/MyContext';
import { GroupTypes } from '@/types';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useRef } from 'react';
import Cookies from 'js-cookie'

type Props = {};

function BereavementFundHero({ }: Props) {

  // const { groupList } = useMyContext()
  const { joinedGroupList } = useGetjoinedGroupList()
  const { currentUser } = useGetProfileData()
  const { groups } = useGetAllGroups()
  const searchParams = useSearchParams()
  const { selectedGroup, setSelectedGroup } = useContext(GroupContext)
  const router = useRouter()
  useEffect(() => {
    if (searchParams.get('admin') === "true" && selectedGroup) {
      return router.push(`/groups/bf/add-new?admin=true`)
    }
    if (selectedGroup) {
      return router.push(`/groups/bf/add-new`)
    }
  }, [selectedGroup])

  return (
    <section className="bg-white text-black px-6 py-12 md:px-16 lg:px-24 w-full h-full">
      <div className="container mx-auto h-[100dvh] flex flex-col-reverse md:flex-row items-center justify-between space-y-8 md:space-y-0 gap-5">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
            Bereavement Fund Support
          </h1>
          <p className="text-lg text-gray-700">
            Providing financial assistance to help cover unexpected costs during difficult times.
          </p>
          <div className="flex justify-center md:justify-start space-x-4 w-full flex-col gap-2">
            {/* <button className="bg-orange-500 text-white py-2 px-6 rounded-md hover:bg-orange-600 transition duration-200">
              Get Started
            </button>
            <button className="border-2 border-blue-800 text-blue-800 py-2 px-6 rounded-md hover:bg-blue-800 hover:text-white transition duration-200">
              Learn More
            </button> */}
            <div className="p-3 mt-5">
              <h1>These are the groups you can create Fund for. Choose one to create BF for: </h1>

              {
                currentUser?.role === 'Admin' ? (
                  groups?.length && groups.map((group, index) => {
                    if (group.has_bf) return
                    return (
                      <div className={`p-2 mt-3 border-2 border-gray-800 rounded-md cursor-pointer flex items-center justify-between hover:bg-neutral-100 transition duration-75 ${selectedGroup?._id === group?._id && 'bg-orange-100 hover:bg-neutral-100'}`}
                        onClick={() => {
                          setSelectedGroup(group)
                        }}
                      >
                        <div className="flex items-center gap-4 ">
                          <Avatar>
                            <AvatarImage src={group?.group_picture} className="bg-black w-[50px] h-[50px] rounded-full" />
                          </Avatar>
                          <h1>{group?.group_name}</h1>
                        </div>

                        <Button
                          className=""
                        >
                          <ArrowRight />
                        </Button>
                      </div>
                    )
                  })
                ) : joinedGroupList?.length && joinedGroupList?.map((group: GroupTypes, index: number) => {

                  if (group?.created_by === currentUser?._id && !group?.has_bf) {
                    return (
                      <div className={`p-2 mt-3 border-2 border-gray-800 rounded-md cursor-pointer flex items-center justify-between hover:bg-neutral-100 transition duration-75 ${selectedGroup?._id === group?._id && 'bg-orange-100 hover:bg-neutral-100'}`}
                        onClick={() => {
                          setSelectedGroup(group)
                        }}
                      >
                        <div className="flex items-center gap-4 ">
                          <Avatar>
                            <AvatarImage src={group?.group_picture} className="bg-black w-[50px] h-[50px] rounded-full" />
                          </Avatar>
                          <h1>{group?.group_name}</h1>
                        </div>

                        <Button
                          className=""
                        >
                          <ArrowRight />
                        </Button>
                      </div>
                    )
                  }
                })
              }
            </div>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="flex-1 hidden md:block">
          <div className="w-full h-64 md:h-80 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center relative">
            <img
              src={'/hero-photo-bf.jpg'}
              className="w-full h-full absolute left-0 top-0 object-cover rounded-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BereavementFundHero;
