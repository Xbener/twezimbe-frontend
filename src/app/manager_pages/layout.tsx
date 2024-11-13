'use client'
import { useGetProfileData } from "@/api/auth";
import Header from "@/components/admin/Header";
import DashboardTopBar from "@/components/DashboardTopBar";
import ManagerDashBoardSideMenuBar from "@/components/ManagerDashBoardSideMenuBar";
import AdminContextProvider from "@/context/AdminContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Cookies from 'js-cookie'

export default function ManagerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()


  if (pathname.includes('/signin')) return <>{children}</>
  useEffect(() => {
    if (!Cookies.get('access-token') || Cookies.get('admin') !== 'true') window.location.href = '/manager_pages/signin'
  }, [])
  return (
    <AdminContextProvider>
      <div className="flex min-h-screen w-full">
        <ManagerDashBoardSideMenuBar />
        <div className="flex flex-col w-full flex-grow bg-slate-100 overflow-auto">
          <Header />
          <div className="p-5 ">
            {/* <Outlet /> */}
            {children}
          </div>
        </div>
      </div>
    </AdminContextProvider>
  )
}
