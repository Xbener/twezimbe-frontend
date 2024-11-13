import React from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, Label } from 'recharts'

interface Props {
    data: {
        date?: string
        amount?: any
    }[]
}

function AreaChartComponent({ data }: Props) {
    return (
        <AreaChart className='w-full' width={450} height={300} data={data}
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
            <XAxis interval={2} dataKey="date">
                {/* <Label value="Date" offset={-1} position="insideBottom" /> */}
            </XAxis>
            <YAxis dataKey="amount">
                <Label value="Amount" angle={-90} offset={5} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip />
            <Area type="monotone" dataKey="amount" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
    )
}

export default AreaChartComponent
