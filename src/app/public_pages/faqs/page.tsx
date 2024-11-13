import Faq from '@/components/Faq'
import ContactUs from '@/components/sections/Contact-us'
import React from 'react'

type Props = {}

function page({ }: Props) {
  return (
    <div className='w-full flex flex-col text-neutral-700'>

      <div className='w-full'>
        <Faq />
      </div>

      <div className='w-full mt-5'>
        <ContactUs />
      </div>

    </div>
  )
}

export default page