import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type AgeGroupsData = {
    ageGroup: string
    count: number
}

type Props = {
    data: AgeGroupsData[]
}

const AgeGroupsBarChart: React.FC<Props> = ({ data }) => {
    return (
        <div className="w-full h-[300px] bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Age Group Distribution</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AgeGroupsBarChart
