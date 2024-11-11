
'use client'

import { AdminContext } from "@/context/AdminContext"
import { MetaData } from "@/types"
import { useContext, useEffect, useState } from "react"

const ManagerDashboard = () => {
  let [metadata, setMetadata] = useState<MetaData[] | null>(null)
  const { users, groups, bfs, isLoading } = useContext(AdminContext)
  useEffect(() => {
    setMetadata([
      {
        title: "Total users",
        value: users?.length
      },
      {
        title: "Total groups",
        value: groups?.length
      },
      {
        title: "Total bereavement funds",
        value: bfs?.length
      }
    ])

  }, [
    isLoading, groups, bfs, users
  ])


  return (
    <div className="w-full p-3 mt-5 flex flex-col items-start gap-2">
      <div className='flex gap-2 w-full flex-wrap'>
        {
          metadata?.length ? metadata.map((card, index) => {
            return (
              <div
                className={`flex-1 min-w-auto flex-col max-w-[15%] border border-white p-4 rounded-lg shadow-md flex justify-around bg-white `}
              >
                <div className="text-sm font-semibold ">{card.title}</div>
                <div className="text-[1.2rem] font-bold">{card.value}</div>
              </div>
            )
          }) : null
        }
      </div>
    </div>
  )
}

export default ManagerDashboard