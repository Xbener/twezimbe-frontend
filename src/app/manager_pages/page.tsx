'use client'

import { GroupedBarChartComponent } from "@/components/charts/AdminDateChart"
import AreaChartComponent from "@/components/charts/AreaChart"
import { AdminContext } from "@/context/AdminContext"
import { MetaData, Transaction } from "@/types"
import { formatWithCommas } from "@/utils/formatNumber"
import moment from "moment"
import { useContext, useEffect, useState } from "react"

// Format functions remain unchanged
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
  const [metadata, setMetadata] = useState<MetaData[] | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // Default to current year
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()) // Default to current month
  const { users, groups, bfs, isLoading, transactions, messages, faqs } = useContext(AdminContext)

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
        title: "Bereavement funds",
        value: bfs?.length || 0
      },
      {
        title: "Platform transactions",
        value: transactions?.length || 0
      },
      {
        title: "System messages",
        value: messages?.length || 0
      },
      {
        title: "Total FAQs",
        value: faqs?.length || 0
      }
    ])
  }, [isLoading, groups, bfs, users])

  const groupByCreationDate = (items: { createdAt?: Date }[] = [], year: number, month: number) => {
    if (items.length) {
      return items.reduce((acc, item) => {
        if (item.createdAt) {
          const createdDate = new Date(item.createdAt);
          if (createdDate.getFullYear() === year && createdDate.getMonth() === month) {
            const formattedDate = formatOtherDates(createdDate);
            acc[formattedDate] = (acc[formattedDate] || 0) + 1;
          }
        }
        return acc;
      }, {} as Record<string, number>);
    }
    return {}
  };

  const groupTransactionsByDate = (items: Transaction[], year: number, month: number) => {
    if (items.length) {
      return items.reduce((acc, item) => {
        if (item.createdAt && item.amount) {
          const createdDate = new Date(item.createdAt);
          if (createdDate.getFullYear() === year && createdDate.getMonth() === month) {
            const formattedDate = formatDate(createdDate);
            acc[formattedDate] = (acc[formattedDate] || 0) + parseFloat(`${item.amount}`);
          }
        }
        return acc;
      }, {} as Record<string, number>);
    }
    return {};
  };

  const usersByDate = groupByCreationDate(users!, selectedYear, selectedMonth);
  const groupsByDate = groupByCreationDate(groups!, selectedYear, selectedMonth);
  const bfsByDate = groupByCreationDate(bfs!, selectedYear, selectedMonth);
  const transactionsByDate = groupTransactionsByDate(transactions!, selectedYear, selectedMonth);

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

  const groupedData = combineGroupedData(usersByDate, groupsByDate, bfsByDate);

  const areaChartData = getCurrentMonthDates().map(date => ({
    date,
    amount: transactionsByDate[date] || 0
  }));
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
  };

  return (
    <div className="w-full p-3 mt-5 flex flex-col items-start gap-2">
      <div className='md:flex grid sm:grid-cols-3 grid-cols-2 gap-2 w-full  flex-wrap items-start justify-start '>
        {metadata?.length ? metadata.map((card, index) => {
          return (
            <div
              key={index}
              className="flex min-w-[15%] flex-col border border-white p-4 rounded-lg shadow-md bg-white justify-normal  items-start"
            >
              <div className="text-sm font-semibold text-center">{card.title}</div>
              <div className="text-[1.2rem] font-bold text-center">{card.value}</div>
            </div>
          )
        }) : null}
      </div>


      <div className="flex items-center gap-3 w-full bg-white p-2">
        <h1>Filters: </h1>
        <div className="flex gap-2 items-center">
          <label htmlFor="year" className="font-semibold">Year</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="mt-2 p-2 border rounded"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label htmlFor="month" className="font-semibold">Month</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="mt-2 p-2 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{moment().month(i).format('MMM')}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full flex bg-white p-2 rounded-md justify-around flex-col lg:flex-row  overflow-auto items-center">

        <div className="text-center font-bold text-neutral-600 mt-5">
          <h1>Groups, users and Bereavement funds by {selectedYear}</h1>
          <GroupedBarChartComponent data={groupedData} />
        </div>

        <div className="text-center font-bold text-neutral-600 mt-5">
          <h1>transactions made each day {moment(`${selectedMonth + 1}-${selectedYear}`, "M-YYYY").format("MMMM - YYYY")}</h1>
          <AreaChartComponent data={areaChartData} />
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
