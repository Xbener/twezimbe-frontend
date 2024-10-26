
'use client'
import MainLoader from '@/components/MainLoader'

import { DMContext } from '@/context/DMContext'
import { GroupContext } from '@/context/GroupContext'
import { useMyContext } from '@/context/MyContext'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

type Props = {}

function page({ }: Props) {
  const { setCurrentDM } = useContext(DMContext)
  const { userDMs } = useMyContext()
  const router = useRouter()

  if (userDMs.length > 0) {
    setCurrentDM(userDMs[0])
    router.push(`/groups/direct/${userDMs[0]._id}`)
  }
  return (
    <div className='w-[100%] flex items-center justify-center h-full'>
      {
        userDMs.length === 0 && "No DMs"
      }
    </div>
  )
}

export default page