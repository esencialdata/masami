import React from 'react';
import { TrendingUp, Minus } from 'lucide-react';

const InflationTracker = ({ supplies }) => {

    const alerts = React.useMemo(() => {
        const list = [];

        supplies.forEach(supply => {
            if (!supply.history || supply.history.length < 2) return;

            // Sort history by date desc just in case
            const sortedHistory = [...supply.history].sort((a, b) => new Date(b.date) - new Date(a.date));

            const current = sortedHistory[0];
            const previous = sortedHistory[1];

            if (current.price === previous.price) return; // No change

            const variation = ((current.price - previous.price) / previous.price) * 100;

            // Only care about increases for "Alerta", but visualized all changes
            // Filter only increases ? User prompt: "Detector de Variación... Si el precio bajó mostrar en verde"

            list.push({
                id: supply.id,
                name: supply.name,
                currentPrice: current.price,
                prevPrice: previous.price,
                variation: variation,
                unit: supply.unit
            });
        });

        // Sort by highest increase first
        return list.sort((a, b) => b.variation - a.variation);

    }, [supplies]);

    if (alerts.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <p>No se han detectado variaciones de precio recientes</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {alerts.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                            ${Number(item.prevPrice).toFixed(2)} ➡️ <span className="font-bold text-gray-900">${Number(item.currentPrice).toFixed(2)}</span> / {item.unit}
                        </p>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                        ${item.variation > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {item.variation > 0 ? <TrendingUp size={14} /> : <Minus size={14} />}
                        {item.variation > 0 ? '+' : ''}{item.variation.toFixed(1)}%
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InflationTracker;
