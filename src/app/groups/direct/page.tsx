import React from 'react'

type Props = {}

function page({}: Props) {
  return (
      <div className='w-[100%] flex items-center justify-center h-full'>
          <h1 className='text-[3rem] text-center'>
              Welcome to Direct Messages. Select or start a conversation!
          </h1>
      </div>
  )
}

export default page