"use client"
import { useGetProfileData } from "@/api/auth";
import MobileMenu from "@/components/MobileMenu";
import PrimaryMenu from "@/components/PrimaryMenu";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [isClosed, setIsClosed] = useState(false);
  const { currentUser } = useGetProfileData();

  const handleClose = () => {
    setIsClosed(!isClosed);
  };

  return (
    <>
      <div className="bg-white sticky top-0 z-50 w-full">
        <div className="py-2 md:py-4 px-5 md:container mx-auto flex justify-between items-center w-full">
          <Link href={'/'}><Image src={'/logo.png'} className="bg-white" width={150} height={15} alt="logo" /></Link>

          <Menu onClick={handleClose} className="text-[#2f578b] text-xl cursor-pointer block md:hidden" />

          {isClosed && <MobileMenu currentUser={currentUser!} handleClose={handleClose} />}

          <PrimaryMenu currentUser={currentUser!} />
        </div>
      </div>
    </>
  )
}

export default Header