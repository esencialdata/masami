import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const DailyHistoryReport = ({ transactions }) => {

    // 1. Group by Day
    const dailyData = transactions.reduce((acc, tx) => {
        // Safe date parsing
        const dateKey = tx.date ? tx.date.split('T')[0] : 'Unknown';
        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, income: 0, expenses: 0, txCount: 0 };
        }

        const amount = Number(tx.amount) || 0;
        if (tx.type === 'VENTA') {
            acc[dateKey].income += amount;
        } else {
            acc[dateKey].expenses += amount;
        }
        acc[dateKey].txCount += 1;

        return acc;
    }, {});

    // 2. Sort Descending (Newest first)
    const sortedDays = Object.values(dailyData).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    if (sortedDays.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No hay movimientos en este periodo
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-gray-400" size={20} />
                    Historial Diario
                </h3>
                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
                    {sortedDays.length} días registrados
                </span>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4 text-right text-green-600">Entradas</th>
                            <th className="px-6 py-4 text-right text-red-500">Salidas</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedDays.map((day) => {
                            const balance = day.income - day.expenses;
                            const dateObj = parseISO(day.date);

                            return (
                                <tr key={day.date} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-700 capitalize">
                                        {format(dateObj, 'EEEE d MMM', { locale: es })}
                                        <span className="block text-xs text-gray-400 font-normal">
                                            {day.txCount} movimientos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-green-600">
                                        +${day.income.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-500">
                                        -${day.expenses.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">
                                        <div className={`flex items-center justify-end gap-1 ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {balance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            ${balance.toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4 p-4">
                {sortedDays.map((day) => {
                    const balance = day.income - day.expenses;
                    const dateObj = parseISO(day.date);
                    return (
                        <div key={day.date} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 capitalize text-sm">
                                        {format(dateObj, 'EEEE d MMM', { locale: es })}
                                    </h4>
                                    <p className="text-xs text-gray-500">{day.txCount} movimientos</p>
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                    {balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    ${balance.toFixed(2)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500">Entradas</span>
                                    <span className="font-bold text-green-600">+${day.income.toFixed(2)}</span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500">Salidas</span>
                                    <span className="font-bold text-red-500">-${day.expenses.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyHistoryReport;
