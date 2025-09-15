import React from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import AdminView from '../AdminView';

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-6h4v6m2-12V5a2 2 0 00-2-2H8a2 2 0 00-2 2v5l-3 3v2h18v-2l-3-3z" />
    </svg>
);

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const AdminLayout: React.FC = () => {
    const navLinkClasses = "flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors";
    const activeNavLinkClasses = "bg-primary/10 text-primary font-semibold";

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col flex-shrink-0">
                <div className="text-2xl font-bold text-primary mb-10 px-2">
                    Admin Panel
                </div>
                <nav className="flex-grow space-y-2">
                    <NavLink
                        to="/admin"
                        end 
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                    >
                        <DashboardIcon />
                        Dashboard
                    </NavLink>
                    {/* Admin links selanjutnya bisa ditambahkan di sini */}
                </nav>
                <div className="pt-4 mt-auto border-t">
                     <Link
                        to="/"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                     >
                        <HomeIcon />
                        Kembali ke Toko
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <Routes>
                    <Route path="/" element={<AdminView />} />
                    {/* Rute admin lain bisa didefinisikan di sini, e.g., <Route path="/orders" element={<OrdersView />} /> */}
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout;
