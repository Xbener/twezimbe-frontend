import Header from "@/components/admin/Header";
import DashboardTopBar from "@/components/DashboardTopBar";
import ManagerDashBoardSideMenuBar from "@/components/ManagerDashBoardSideMenuBar";
import AdminContextProvider from "@/context/AdminContext";

export default function ManagerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <AdminContextProvider>
      <div className="flex min-h-screen w-full ">
        <ManagerDashBoardSideMenuBar />
        <div className="flex flex-col w-full bg-slate-100 overflow-y-scroll">
          <Header />
          <DashboardTopBar />
          <div className="p-5">
            {/* <Outlet /> */}
            {children}
          </div>
        </div>
      </div>
   </AdminContextProvider>
  )
}
