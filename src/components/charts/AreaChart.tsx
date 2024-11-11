import React from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
interface Props {
    data: {
        date?: string
        amount?: any
    }[]
}


function AreaChartComponent({ data }: Props) {
    console.log('data', data)
    return (
        <AreaChart className='w-full' width={500} height={250} data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
            </defs>
            <XAxis dataKey={"date"} />
            <YAxis dataKey={"amount"} />
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <Tooltip />
            <Area type="monotone" dataKey={"amount"} stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
    )
}

export default AreaChartComponent