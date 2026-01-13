import React from 'react';
import { Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const BalanceSummary = ({ transactions, dateRange, setDateRange }) => {

    // Helper to calculate totals
    const calculateTotals = () => {
        let income = 0;
        let expenses = 0;

        transactions.forEach(tx => {
            const amount = Number(tx.amount) || 0;
            if (tx.type === 'VENTA') {
                income += amount;
            } else {
                expenses += amount;
            }
        });

        return { income, expenses, net: income - expenses };
    };

    const { income, expenses, net } = calculateTotals();

    const handleRangeChange = (e) => {
        const value = e.target.value;
        const now = new Date();

        switch (value) {
            case 'thisMonth':
                setDateRange({ start: startOfMonth(now), end: endOfMonth(now) });
                break;
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                setDateRange({ start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
                break;
            case 'thisWeek':
                setDateRange({ start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
                break;
            default:
                break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                    <CalendarIcon size={18} />
                    <span className="text-sm font-medium">
                        {format(dateRange.start, "d MMM", { locale: es })} - {format(dateRange.end, "d MMM yyyy", { locale: es })}
                    </span>
                </div>
                <select
                    className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                    onChange={handleRangeChange}
                    defaultValue="thisMonth"
                >
                    <option value="thisWeek">Esta Semana</option>
                    <option value="thisMonth">Este Mes</option>
                    <option value="lastMonth">Mes Pasado</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Income */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Ingresos Totales</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${income.toFixed(2)}</p>
                </div>

                {/* Expenses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ArrowDownLeft size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Gastos Operativos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${expenses.toFixed(2)}</p>
                </div>

                {/* Net Utility */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${net >= 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${net >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <DollarSign size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Utilidad Neta</span>
                    </div>
                    <p className={`text-2xl font-bold ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${net.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BalanceSummary;
