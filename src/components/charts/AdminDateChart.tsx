'use client'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GroupedData {
    date: string
    users: number
    groups: number
    bfs: number
}

interface Props {
    data: GroupedData[]
}

// Colors for each category
const COLORS = {
    users: '#3498DB',
    groups: '#F39C12',
    bfs: '#E74C3C',
};

export const GroupedBarChartComponent = ({ data }: Props) => {
    return (
        <ResponsiveContainer width={450} height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                {/* Bars for each category */}
                <Bar dataKey="users" fill={COLORS.users} name="Joined Users" />
                <Bar dataKey="groups" fill={COLORS.groups} name="Created groups" />
                <Bar dataKey="bfs" fill={COLORS.bfs} name="Created Funds" />
            </BarChart>
        </ResponsiveContainer>
    );
}
