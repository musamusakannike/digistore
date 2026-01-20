import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

const stats = [
    {
        label: "Total Revenue",
        value: "$45,231.89",
        change: "+20.1% from last month",
        icon: DollarSign,
        trend: "up"
    },
    {
        label: "Active Products",
        value: "24",
        change: "+2 new this week",
        icon: ShoppingBag,
        trend: "up"
    },
    {
        label: "Total Customers",
        value: "2,345",
        change: "+180 this month",
        icon: Users,
        trend: "up"
    },
    {
        label: "Sales Rate",
        value: "4.5%",
        change: "+1.2% from last week",
        icon: TrendingUp,
        trend: "up"
    }
];

export default function DashboardStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="glass-card hover:translate-y-[-4px] transition-transform duration-300 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                            <stat.icon className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div className="text-2xl font-bold text-white mb-2 tracking-tight">
                        {stat.value}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        {stat.change}
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -z-10 rounded-full group-hover:bg-white/10 transition-colors" />
                </div>
            ))}
        </div>
    );
}
