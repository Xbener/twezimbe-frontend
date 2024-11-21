import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Case = {
    status: string;
    contributionStatus: string; 
};

type StackedBarChartProps = {
    cases: Case[]; 
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({ cases }) => {
    const data = [
        {
            status: 'Open',
            complete: cases.filter(c => c.status === 'Open' && c.contributionStatus === 'Complete').length,
            incomplete: cases.filter(c => c.status === 'Open' && c.contributionStatus === 'Incomplete').length,
        },
        {
            status: 'Closed',
            complete: cases.filter(c => c.status === 'Closed' && c.contributionStatus === 'Complete').length,
            incomplete: cases.filter(c => c.status === 'Closed' && c.contributionStatus === 'Incomplete').length,
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complete" stackId="a" fill="#82ca9d" />
                <Bar dataKey="incomplete" stackId="a" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default StackedBarChart;
