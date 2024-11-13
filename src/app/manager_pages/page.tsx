'use client'

import { GroupedBarChartComponent } from "@/components/charts/AdminDateChart"
import AreaChartComponent from "@/components/charts/AreaChart"
import { AdminContext } from "@/context/AdminContext"
import { MetaData, Transaction } from "@/types"
import { formatWithCommas } from "@/utils/formatNumber"
import moment from "moment"
import { useContext, useEffect, useState } from "react"

const formatDate = (date: Date) => {
  return moment(date).format("D")
};

const formatOtherDates = (date: Date) => {
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
}

const getCurrentMonthDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return formatDate(date);
  });
  return dates;
};

const ManagerDashboard = () => {
  let [metadata, setMetadata] = useState<MetaData[] | null>(null)
  const { users, groups, bfs, isLoading, transactions, messages } = useContext(AdminContext)

  useEffect(() => {
    setMetadata([
      {
        title: "Joined users",
        value: users?.length || 0
      },
      {
        title: "Created groups",
        value: groups?.length || 0
      },
      {
        title: "created bereavement funds",
        value: bfs?.length || 0
      },
      {
        title: "Total platform transactions",
        value: transactions?.length || 0
      },
      {
        title: "Total system messages",
        value: messages?.length || 0
      }
    ])
  }, [isLoading, groups, bfs, users])
  const groupByCreationDate = (items: { createdAt?: Date }[] = []) => {
    if (items.length) {
      return items?.reduce((acc, item) => {
        if (item.createdAt) {
          const formattedDate = formatOtherDates(new Date(item.createdAt));
          acc[formattedDate] = (acc[formattedDate] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    }
    return {}
  };

  const groupTransactionsByDate = (items: Transaction[]) => {
    if (items.length) {
      return items.reduce((acc, item) => {
        if (item.createdAt && item.amount) {
          const formattedDate = formatDate(new Date(item.createdAt));
          acc[formattedDate] = (acc[formattedDate] || 0) + parseFloat(`${item.amount}`);
        }
        return acc;
      }, {} as Record<string, number>);
    }
    return {};
  };


  let usersByDate = groupByCreationDate(users!);
  let groupsByDate = groupByCreationDate(groups!);
  let bfsByDate = groupByCreationDate(bfs!);
  const transactionsByDate = groupTransactionsByDate(transactions!);

  const combineGroupedData = (
    usersByDate: Record<string, number>,
    groupsByDate: Record<string, number>,
    bfsByDate: Record<string, number>,
  ) => {
    const combinedData: { date: string; users: number; groups: number; bfs: number }[] = [];
    const allDates = Array.from(new Set([
      ...Object.keys(usersByDate),
      ...Object.keys(groupsByDate),
      ...Object.keys(bfsByDate),
    ]));

    allDates.forEach(date => {
      combinedData.push({
        date,
        users: usersByDate[date] || 0,
        groups: groupsByDate[date] || 0,
        bfs: bfsByDate[date] || 0,
      });
    });

    return combinedData;
  };

  const groupedData = combineGroupedData(
    usersByDate,
    groupsByDate,
    bfsByDate,
    // transactionsByDate
  );

  const areaChartData = getCurrentMonthDates().map(date => ({
    date,
    amount: transactionsByDate[date] || 0
  }));
  return (
    <div className="w-full p-3 mt-5 flex flex-col items-start gap-2">
      <div className='flex gap-2 w-full flex-wrap items-start justify-start'>
        {
          metadata?.length ? metadata.map((card, index) => {
            return (
              <div
                key={index}
                className="flex min-w-[15%] flex-col border border-white p-4 rounded-lg shadow-md bg-white justify-around items-start"
              >
                <div className="text-sm font-semibold text-center">{card.title}</div>
                <div className="text-[1.2rem] font-bold text-center">{card.value}</div>
              </div>
            )
          }) : null
        }
      </div>

      <div className="w-full flex items-start bg-white p-2 rounded-md justify-around ">
        <div className="text-center font-bold text-neutral-600 mt-5">
          <h1>Groups, users and Bereavement funds by each month</h1>
          <GroupedBarChartComponent data={groupedData} />
        </div>

        <div className="text-center font-bold text-neutral-600 mt-5">
          <h1>Total transactions made each day {moment().format("MMMM - YYYY")}</h1>
          <AreaChartComponent data={areaChartData} />
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
