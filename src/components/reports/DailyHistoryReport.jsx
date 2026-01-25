import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const DailyHistoryReport = ({ transactions }) => {
    // Group transactions by day
    const dailyData = useMemo(() => {
        const groups = {};

        transactions.forEach(tx => {
            if (!tx.date) return; // Skip if no date

            // Ensure we have a valid date string YYYY-MM-DD
            const dateObj = new Date(tx.date);
            if (isNaN(dateObj.getTime())) return; // Skip invalid dates

            const dateKey = format(dateObj, 'yyyy-MM-dd');

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateObj,
                    income: 0,
                    expenses: 0,
                    transactions: []
                };
            }

            const amount = Number(tx.amount) || 0;
            if (tx.type === 'VENTA') {
                groups[dateKey].income += amount;
            } else {
                groups[dateKey].expenses += amount;
            }

            groups[dateKey].transactions.push(tx);
        });

        // Convert to array and sort descending (newest first)
        return Object.values(groups).sort((a, b) => b.date - a.date);
    }, [transactions]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 text-primary rounded-xl ring-4 ring-orange-50/50">
                    <Calendar size={22} className="text-orange-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">Historial Diario</h2>
                    <p className="text-sm text-gray-500">Desglose de rentabilidad por día</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {dailyData.map((dayData) => (
                    <DailyCard key={dayData.date.toISOString()} data={dayData} />
                ))}

                {dailyData.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                            <AlertCircle size={32} className="text-gray-300" />
                        </div>
                        <p className="font-medium">No hay transacciones en este periodo</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DailyCard = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const balance = data.income - data.expenses;
    const isProfit = balance >= 0;

    // Calculations for insights
    const totalVolume = data.income + data.expenses;
    const safeIncome = data.income || 1; // Avoid division by zero
    const expenseRatio = Math.min((data.expenses / safeIncome) * 100, 100);
    const marginPercent = ((balance / safeIncome) * 100).toFixed(1);

    return (
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            {/* Header Card */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100/80 backdrop-blur-sm text-gray-600 font-bold text-xs uppercase px-2.5 py-1.5 rounded-lg border border-gray-200">
                            {format(data.date, 'MMM', { locale: es })}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg capitalize tracking-tight">
                            {format(data.date, 'EEEE d', { locale: es })}
                        </h3>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border",
                        isProfit
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                    )}>
                        {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isProfit ? `${marginPercent}% Margen` : "Déficit"}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Financial Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm group/row">
                            <span className="text-gray-500 flex items-center gap-1.5 transition-colors group-hover/row:text-green-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Ingresos
                            </span>
                            <span className="font-bold text-gray-900 tabular-nums tracking-tight">
                                ${data.income.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm group/row">
                            <span className="text-gray-500 flex items-center gap-1.5 transition-colors group-hover/row:text-red-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Gastos
                            </span>
                            <span className="font-semibold text-gray-600 tabular-nums tracking-tight">
                                ${data.expenses.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Efficiency Bar */}
                    <div className="py-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            {/* The "Expense" part matches the ratio */}
                            <div
                                className="h-full bg-red-400 rounded-l-full"
                                style={{ width: `${expenseRatio}%` }}
                            />
                            {/* The rest is profit (green) */}
                            <div className="h-full bg-green-500 flex-1" />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-1.5 tracking-wider">
                            <span>Gastos: {expenseRatio.toFixed(0)}%</span>
                            <span>Utilidad</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Balance Neto</span>
                        <span className={cn(
                            "text-xl font-black tabular-nums tracking-tight",
                            isProfit ? "text-gray-900" : "text-red-500"
                        )}>
                            {isProfit ? '+' : ''}${balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Toggle Details Action */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors group/toggle"
            >
                <span className="text-xs font-semibold text-gray-400 group-hover/toggle:text-gray-600 transition-colors">
                    {isExpanded ? 'Ocultar desglose' : 'Ver transacciones'}
                </span>
                {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-400 group-hover/toggle:text-primary transition-colors" />
                ) : (
                    <ChevronDown size={18} className="text-gray-400 group-hover/toggle:text-primary transition-colors" />
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="bg-gray-50/80 backdrop-blur-sm px-6 pb-6 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-5">
                        {/* Mini Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Transacciones</span>
                                <span className="block font-bold text-gray-900 text-lg tabular-nums">
                                    {data.transactions.length}
                                </span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ticket Prom.</span>
                                <span className="block font-bold text-gray-900 text-lg tabular-nums">
                                    ${(data.income / (data.transactions.filter(t => t.type === 'VENTA').length || 1)).toFixed(0)}
                                </span>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div>
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Movimientos</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {data.transactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center text-xs p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-gray-700 font-medium truncate max-w-[140px]">{tx.description}</span>
                                            <span className="text-[10px] text-gray-400">{format(new Date(tx.date), 'HH:mm', { locale: es })}</span>
                                        </div>
                                        <span className={cn(
                                            "font-bold tabular-nums bg-opacity-10 px-2 py-1 rounded-md",
                                            tx.type === 'VENTA'
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-600"
                                        )}>
                                            {tx.type === 'VENTA' ? '+' : '-'}${Number(tx.amount).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyHistoryReport;
