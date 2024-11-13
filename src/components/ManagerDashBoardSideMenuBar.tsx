"use client"
import { ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
import React, { useContext } from "react"
import { AdminContext } from "@/context/AdminContext"
import { usePathname } from "next/navigation"
import Cookies from 'js-cookie'

const ManagerDashBoardSideMenuBar = () => {
    const { isVisible, toggleSideBar, windowWidth } = useContext(AdminContext)
    const pathname = usePathname()

    const logout = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logged out");
        Cookies.remove('access-token');
        Cookies.remove('admin')
        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/manager_pages/signin`
    }

    // Array of menu items
    const menuItems = [
        { href: "/manager_pages", label: "Dashboard" },
        { href: "/manager_pages/users", label: "Users" },
        { href: "/manager_pages/groups", label: "Groups" },
        { href: "/manager_pages/bfs", label: "Bereavement Funds" },
        { href: "/manager_pages/transactions", label: "Transactions" },
        { href: "/manager_pages/messages", label: "Messages" },
        { href: "/manager_pages/faqs", label: "FAQs" },
    ]

    if (isVisible) {
        return (
            <div className="md:sticky md:flex h-[100dvh] overflow-auto shadow-sm min-w-full md:min-w-[20%] fixed top-0 left-0 z-50 ">
                <div className={`min-h-screen flex-1 flex-col justify-between border-e bg-blue-950 cursor-pointer`}>
                    <div className="px-4 py-4">
                        <div className="flex">
                            <ArrowLeft className='items-center cursor-pointer md:hidden block text-white' onClick={toggleSideBar} />
                            <Link href={'/'} className="text-3xl font-bold tracking-tight text-white">
                                <img
                                    src="/assets/Twezimbe Logo Final PNG.png"
                                    width={300}
                                    height={100}
                                />
                            </Link>
                        </div>

                        {/* Mapping over menuItems */}
                        <ul className="mt-6 space-y-1">
                            {menuItems.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className={`block rounded-lg ${(pathname.includes(href) && pathname === '/manager_pages') && 'bg-gray-100 text-slate-800'} px-4 py-2 text-sm font-medium text-slate-200 hover:bg-gray-100 hover:text-gray-700`}
                                        onClick={() => {
                                            // Toggle sidebar if window width is below 770
                                            if (windowWidth && windowWidth < 770) toggleSideBar()
                                        }}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}

                            {/* Account section */}
                            <li>
                                <details className="group [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-slate-200 hover:bg-gray-100 hover:text-gray-700">
                                        <span className="text-sm font-medium"> Account</span>
                                        <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </summary>

                                    <ul className="mt-2 space-y-1 px-4">
                                        <li>
                                            <Link href="/public_pages/Profile" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-200 hover:bg-gray-100 hover:text-gray-700">
                                                Profile
                                            </Link>
                                        </li>
                                    </ul>
                                </details>
                            </li>
                        </ul>
                    </div>

                    <div className="sticky inset-x-0 bottom-0 bg-blue-950 p-2">
                        <form onSubmit={logout}>
                            <button type="submit" className="group relative flex w-full justify-start rounded-lg px-2 py-1.5 text-sm text-slate-200 hover:bg-gray-50 hover:text-gray-700 items-center gap-3">
                                <LogOut />
                                <span>Logout</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default ManagerDashBoardSideMenuBar;
