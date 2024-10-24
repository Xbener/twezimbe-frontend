import MainLoader from '@/components/MainLoader'
import React from 'react'

type Props = {}

function page({}: Props) {
  return (
      <div className='w-[100%] flex items-center justify-center h-full'>
         <MainLoader/>
      </div>
  )
}

export default page