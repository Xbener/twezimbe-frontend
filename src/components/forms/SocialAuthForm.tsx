import React from 'react'
import { AiFillFacebook, AiFillGoogleCircle, AiFillGoogleSquare } from 'react-icons/ai'

import { Button } from '../ui/button'
import { FacebookIcon } from 'lucide-react'
import Image from 'next/image'

type Props = {}

export const socials = [
  { name: "Google", icon: "/brand-logos/google.svg", color: "red" },
  { name: "Facebook", icon: "/brand-logos/facebook.svg", color: "lightblue" },
]

function SocialAuthForm({ }: Props) {

  const continueWithGoogle = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`
  }

  const continueWithFacebook = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/facebook`
  }
  return (
    <div className='w-full flex flex-col justify-center items-center p-5 gap-5'>
      <p>Or </p>
      <hr className='w-full' />
      <div className='w-full flex items-start gap-5 justify-start flex-col md:flex-row'>
        {/* <button type='button' className='border-[2px] p-3 rounded-xl cursor-pointer hover:scale-105 duration-200' onClick={continueWithGoogle}>
          <AiFillGoogleCircle />
          Google
        </button>
        <button type='button' className='border-[2px] p-3 rounded-xl cursor-pointer hover:scale-105 duration-200' onClick={continueWithFacebook}>
          <AiFillFacebook />
          Facebook
        </button> */}

        {
          socials.map((social, index) => (
            <Button
              color={'#00a884'}
              key={index}
              type='button'
              className={`w-full border-[2px] p-5 flex items-center gap-2 rounded-xl cursor-pointer`} // Removed justify-start to let items align left by default
              onClick={() => {
                social.name === "Facebook" ? continueWithFacebook() : continueWithGoogle()
              }}
            >
              <span style={{ borderColor: social.color, color: social.color }} className="">
                <Image
                  src={social.icon}
                  width={30}
                  height={50}
                  alt={''}
                />
              </span>
              <span>
                Continue With
              </span>
              {social.name}
            </Button>
          ))
        }
      </div>
    </div>
  )
}

export default SocialAuthForm