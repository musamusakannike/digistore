import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar */}
            <div className="hidden lg:block w-64 fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Background Grain/Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-50 brightness-100 contrast-150"></div>
            </div>
        </div>
    );
}
