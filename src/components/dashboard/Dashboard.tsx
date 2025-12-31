// src/components/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
    Home,
    PlusCircle,
    RefreshCw,
    Users,
    Tag,
    Eye,
    Package,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const {
        stats,
        recentOrders,
        loading,
        error,
        fetchDashboardData,
        startPolling,
        stopPolling,
    } = useDashboardStore();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        console.log('Dashboard mounted, fetching data...');
        setIsMounted(true);
        fetchDashboardData();
        startPolling();

        return () => {
            console.log('Dashboard unmounting, stopping polling...');
            stopPolling();
        };
    }, []);

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount).replace(',', '.');
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            'request': 'bg-sky-100 text-sky-800 border-sky-200',
            'washing': 'bg-amber-100 text-amber-800 border-amber-200',
            'drying': 'bg-orange-100 text-orange-800 border-orange-200',
            'ironing': 'bg-purple-100 text-purple-800 border-purple-200',
            'ready': 'bg-green-100 text-green-800 border-green-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            'request': 'Baru',
            'washing': 'Cuci',
            'drying': 'Kering',
            'ironing': 'Setrika',
            'ready': 'Siap',
            'completed': 'Selesai',
        };
        return texts[status] || 'Baru';
    };

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sky-600 font-medium text-sm md:text-base">Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-3 md:p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
                    <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-xs md:text-sm text-sky-500">
                        Ringkasan aktivitas hari ini
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 md:p-4 rounded-2xl flex items-start md:items-center gap-2 md:gap-3 shadow-sm mb-4 md:mb-6">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-sm md:text-base">Terjadi Kesalahan</p>
                        <p className="text-xs md:text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats - Mobile First */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 border-2 border-sky-100 mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-4 border-b-2 border-sky-100 pb-3">
                    <h2 className="text-base md:text-lg font-bold text-sky-700">Statistik Hari Ini</h2>
                    <div className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 border-2 border-green-200 font-bold">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="hidden sm:inline">Live</span>
                    </div>
                </div>

                {loading && stats.todayOrders === 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gradient-to-r from-sky-50 to-sky-100 p-3 md:p-4 rounded-xl animate-pulse border-2 border-sky-200">
                                <div className="h-6 md:h-8 bg-sky-200 rounded mb-2" />
                                <div className="h-3 md:h-4 bg-sky-200 rounded w-2/3 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-3 md:p-4 lg:p-5 rounded-xl text-center border-2 border-sky-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-sky-700 mb-1">
                                {stats.todayOrders}
                            </div>
                            <div className="text-xs md:text-sm text-sky-600 font-bold flex flex-col md:flex-row items-center justify-center gap-1 mt-1">
                                <Package className="w-3 h-3 md:w-4 md:h-4 hidden sm:block" />
                                <span>Total Transaksi</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 md:p-4 lg:p-5 rounded-xl text-center border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-700 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                {formatCurrency(stats.todayRevenue)}
                            </div>
                            <div className="text-xs md:text-sm text-green-600 font-bold flex flex-col md:flex-row items-center justify-center gap-1 mt-1">
                                <DollarSign className="w-3 h-3 md:w-4 md:h-4 hidden sm:block" />
                                <span>Pendapatan</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 lg:p-5 rounded-xl text-center border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-700 mb-1">
                                {stats.completedToday}
                            </div>
                            <div className="text-xs md:text-sm text-purple-600 font-bold flex flex-col md:flex-row items-center justify-center gap-1 mt-1">
                                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 hidden sm:block" />
                                <span>Selesai</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 md:p-4 lg:p-5 rounded-xl text-center border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-700 mb-1">
                                {stats.inProgress}
                            </div>
                            <div className="text-xs md:text-sm text-orange-600 font-bold flex flex-col md:flex-row items-center justify-center gap-1 mt-1">
                                <Clock className="w-3 h-3 md:w-4 md:h-4 hidden sm:block" />
                                <span>Dalam Proses</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions & Recent Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 border-2 border-sky-100">
                    <h2 className="text-base md:text-lg font-bold text-sky-700 mb-3 md:mb-4 border-b-2 border-sky-100 pb-2 md:pb-3">Aksi Cepat</h2>

                    <Link
                        to="/orders/create"
                        className="inline-flex w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-center font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl mb-3 transition-all duration-300 items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl text-sm md:text-base"
                    >
                        <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Transaksi Baru</span>
                    </Link>

                    <Link
                        to="/process"
                        className="inline-flex w-full bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-50 hover:border-sky-600 text-center font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl mb-3 transition-all duration-300 items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md text-sm md:text-base"
                    >
                        <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Update Proses</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <Link
                            to="/customers"
                            className="bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-50 hover:border-sky-600 text-center font-bold py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 shadow-sm hover:shadow-md"
                        >
                            <Users className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Member</span>
                        </Link>
                        <Link
                            to="/services"
                            className="bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-50 hover:border-sky-600 text-center font-bold py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 shadow-sm hover:shadow-md"
                        >
                            <Tag className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Harga</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 border-2 border-sky-100">
                    <div className="flex justify-between items-center mb-3 md:mb-4 border-b-2 border-sky-100 pb-2 md:pb-3">
                        <h2 className="text-base md:text-lg font-bold text-sky-700">Transaksi Terbaru</h2>
                        {loading && (
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-sky-600 font-medium">
                                <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                <span className="hidden sm:inline">Memperbarui...</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                        {loading && recentOrders.length === 0 ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-3 md:p-4 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl animate-pulse border border-sky-200">
                                    <div className="h-3 md:h-4 bg-sky-200 rounded w-1/3 mb-2" />
                                    <div className="h-2.5 md:h-3 bg-sky-200 rounded w-1/2" />
                                </div>
                            ))
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-4 md:py-6 lg:py-8">
                                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center">
                                    <Package className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-sky-400" />
                                </div>
                                <p className="text-sky-600 font-bold text-sm md:text-base lg:text-lg">Belum ada transaksi hari ini</p>
                                <p className="text-xs md:text-sm text-sky-500 mt-1 md:mt-2">Mulai dengan membuat transaksi baru</p>
                            </div>
                        ) : (
                            recentOrders.slice(0, 4).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-sky-50 to-white rounded-xl hover:from-sky-100 hover:to-sky-50 transition-all duration-300 border-2 border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sky-900 text-sm md:text-base truncate">
                                            {order.order_number}
                                        </div>
                                        <div className="text-xs md:text-sm text-sky-600 font-medium truncate">
                                            {order.customer.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                                        <span className={`px-2 md:px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusBadge(order.status)} whitespace-nowrap`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="text-sky-600 hover:text-sky-700 p-1.5 md:p-2 hover:bg-sky-100 rounded-lg transition-all duration-200 border border-sky-200"
                                            title="Lihat detail"
                                        >
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {recentOrders.length > 0 && (
                        <Link
                            to="/orders"
                            className="inline-flex w-full bg-gradient-to-r from-sky-100 to-sky-50 hover:from-sky-200 hover:to-sky-100 text-sky-700 text-center font-bold py-2.5 md:py-3 px-4 rounded-xl transition-all duration-300 items-center justify-center gap-2 border-2 border-sky-200 shadow-sm hover:shadow-md text-sm md:text-base"
                        >
                            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Lihat Semua Transaksi</span>
                            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-auto" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Refresh Button - Mobile Bottom Center */}
            <button
                onClick={() => fetchDashboardData()}
                disabled={loading}
                className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-10 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
                aria-label="Refresh dashboard"
            >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default Dashboard;