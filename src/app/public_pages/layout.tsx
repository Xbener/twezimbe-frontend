import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import React, { Suspense } from "react";


export default function HomeLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
   <Suspense>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className={`w-full md:container mx-auto flex-1 py-10`}>
          {children}
        </div>
        <Footer />
      </div>
   </Suspense>
  )
}
