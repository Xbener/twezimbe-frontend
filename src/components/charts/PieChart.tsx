'use client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts'

interface Props {
    data: {
        name?: string
        amount?: any
    }[]
}

// Define initial colors
const BASE_COLORS = ['#76D7C4', '#F39C12', '#E74C3C', '#3498DB', '#2ECC71'];

// Function to generate a new color based on an index
const generateColor = (index: number) => {
    const hue = (index * 137) % 360; // Using a prime-based offset to get varied hues
    return `hsl(${hue}, 70%, 50%)`;
}

export const PieChartComponent = ({ data }: Props) => {
    return (
        <PieChart width={500} height={300} className="text-white">
            <Tooltip />
            {/* <Legend /> */}
            <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
            >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={index < BASE_COLORS.length ? BASE_COLORS[index] : generateColor(index)}
                    />
                ))}
            </Pie>
        </PieChart>
    );
}
