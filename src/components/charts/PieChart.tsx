'use client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts'

// Example data for member deposits
const data = [
    { name: "John Doe", deposit: 15900 },
    { name: "Jane Smith", deposit: 12000 },
    { name: "Mark Johnson", deposit: 8500 },
    { name: "Emily Davis", deposit: 2000 },
    { name: "Paul Brown", deposit: 5000 },
];
const COLORS = ['#76D7C4', '#F39C12', '#E74C3C', '#3498DB', '#2ECC71'];
export const PieChartComponent = () => {
    return (
        <PieChart width={500} height={300} className="text-white">
            <Tooltip />
            {/* <Legend /> */}
            <Pie
                data={data}
                dataKey="deposit"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
        </PieChart>
    );
}
