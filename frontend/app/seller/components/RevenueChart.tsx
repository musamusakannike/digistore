"use client";

// Simple CSS-only bar chart
export default function RevenueChart() {
    const data = [40, 70, 45, 90, 65, 85, 55, 75, 60, 95, 80, 50];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                    <p className="text-sm text-gray-500">Monthly revenue performance</p>
                </div>
                <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1 focus:outline-none">
                    <option>This Year</option>
                    <option>Last Year</option>
                </select>
            </div>

            <div className="h-64 flex items-end justify-between gap-2">
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                            className="w-full bg-gradient-to-t from-white/10 to-white/30 rounded-t-sm transition-all duration-500 relative group-hover:from-white/20 group-hover:to-white/50"
                            style={{ height: `${value}%` }}
                        >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded transition-opacity">
                                {value}%
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{months[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
