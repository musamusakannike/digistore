import { MoreHorizontal } from "lucide-react";

const orders = [
    {
        id: "ORD-001",
        customer: "Sarah Williams",
        product: "SaaS Dashboard UI Kit",
        amount: "$49.00",
        status: "Completed",
        date: "Today, 2:30 PM"
    },
    {
        id: "ORD-002",
        customer: "Michael Chen",
        product: "3D Icons Pack",
        amount: "$29.00",
        status: "Processing",
        date: "Today, 1:15 PM"
    },
    {
        id: "ORD-003",
        customer: "Jessica Taylor",
        product: "E-Commerce Template",
        amount: "$79.00",
        status: "Completed",
        date: "Yesterday"
    },
    {
        id: "ORD-004",
        customer: "David Smith",
        product: "Portfolio Theme",
        amount: "$39.00",
        status: "Failed",
        date: "Yesterday"
    },
    {
        id: "ORD-005",
        customer: "Emma Wilson",
        product: "Social Media Assets",
        amount: "$19.00",
        status: "Completed",
        date: "Oct 24"
    }
];

export default function RecentOrders() {
    return (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                    <p className="text-sm text-gray-500">You made 12 sales today</p>
                </div>
                <button className="text-sm text-white hover:text-white/70 transition-colors">View All</button>
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{order.product}</div>
                                    <div className="text-xs text-gray-500">{order.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                                        <span className="text-sm text-gray-300">{order.customer}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`
                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                                        ${order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                        ${order.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                                    `}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-white font-medium">{order.amount}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
