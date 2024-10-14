import React from 'react'

type Props = {}

function SocialAuthForm({}: Props) {
  return (
    <div className='w-full flex flex-col justify-center items-center p-5 gap-5'>
          <p>Or Continue With: </p>
        <hr className='w-full'/>
          <div className='w-full flex items-center gap-5 justify-center'>
              <button type='button' className='border-[2px] p-3 rounded-xl cursor-pointer hover:scale-105 duration-200'>
                  Google
              </button>
              <button type='button' className='border-[2px] p-3 rounded-xl cursor-pointer hover:scale-105 duration-200'>
                  Facebook
              </button>
          </div>
    </div>
  )
}

export default SocialAuthForm