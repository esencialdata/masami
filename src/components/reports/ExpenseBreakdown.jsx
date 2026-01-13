import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#8884d8', '#82ca9d'];

const ExpenseBreakdown = ({ transactions }) => {

    const data = React.useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'GASTO');
        const grouped = {};

        expenses.forEach(tx => {
            // Simple grouping by description (concept)
            // ideally we would have a 'category' field
            const key = tx.description || 'Otros';
            if (!grouped[key]) grouped[key] = 0;
            grouped[key] += Number(tx.amount);
        });

        return Object.keys(grouped).map(name => ({
            name,
            value: grouped[name]
        })).sort((a, b) => b.value - a.value); // Sort highest first

    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <p>No hay gastos registrados en este periodo</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `$${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseBreakdown;
