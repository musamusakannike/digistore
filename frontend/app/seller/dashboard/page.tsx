import DashboardStats from "../components/DashboardStats";
import RevenueChart from "../components/RevenueChart";
import RecentOrders from "../components/RecentOrders";

export default function SellerDashboard() {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome back, Alex. Here's what's happening with your store.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Add New Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Charts & Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                <div className="lg:col-span-2 h-full">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1 h-full">
                    <RecentOrders />
                </div>
            </div>

            {/* Additional Section (e.g. Activity or Recommendations) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Placeholder for future widgets */}
            </div>
        </>
    );
}
