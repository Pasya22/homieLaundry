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
    TrendingUp
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
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            'request': 'bg-blue-100 text-blue-800',
            'washing': 'bg-yellow-100 text-yellow-800',
            'drying': 'bg-orange-100 text-orange-800',
            'ironing': 'bg-purple-100 text-purple-800',
            'ready': 'bg-green-100 text-green-800',
            'completed': 'bg-green-100 text-green-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
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

    // Initial loading state
    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Home className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Dashboard
                </h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 bg-linear-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                        <p className="font-medium">Terjadi Kesalahan</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2">Aksi Cepat</h2>

                <Link
                    to="/orders/create"
                    className="inline-flex w-full bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center font-medium py-3 px-4 rounded-lg mb-3 transition duration-200 items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Transaksi Baru</span>
                </Link>

                <Link
                    to="/process"
                    className="inline-flex w-full bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 text-center font-medium py-3 px-4 rounded-lg mb-3 transition duration-200 items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    <span>Update Proses</span>
                </Link>

                <div className="flex gap-3">
                    <Link
                        to="/customers"
                        className="flex-1 bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 text-center font-medium py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                    >
                        <Users className="w-4 h-4" />
                        Member
                    </Link>
                    <Link
                        to="/services"
                        className="flex-1 bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 text-center font-medium py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                    >
                        <Tag className="w-4 h-4" />
                        Harga
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-semibold text-blue-700">Transaksi Terbaru</h2>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Memperbarui...
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {loading && recentOrders.length === 0 ? (
                        // Skeleton loading
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 bg-gray-50 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Belum ada transaksi hari ini</p>
                            <p className="text-sm text-gray-400 mt-1">Mulai dengan membuat transaksi baru</p>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-gray-50 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition duration-200 border border-gray-200 hover:border-blue-200"
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {order.order_number}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {order.customer.name}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)} border`}>
                                        {getStatusText(order.status)}
                                    </span>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition duration-200"
                                        title="Lihat detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Link
                    to="/orders"
                    className="inline-flex w-full bg-gray-100 bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 text-center font-medium py-2 px-4 rounded-lg mt-3 transition duration-200 items-center justify-center gap-2 border border-gray-200"
                >
                    <TrendingUp className="w-4 h-4" />
                    <span>Lihat Semua</span>
                </Link>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-semibold text-blue-700">Statistik Hari Ini</h2>
                    <div className="text-xs bg-green-50 bg-linear-to-r from-green-50 to-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </div>
                </div>

                {loading && stats.todayOrders === 0 ? (
                    // Stats skeleton loading
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-50 bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-lg animate-pulse border">
                                <div className="h-6 bg-gray-200 rounded mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-50 bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200 shadow-sm">
                            <div className="text-2xl font-bold text-blue-700">
                                {stats.todayOrders}
                            </div>
                            <div className="text-sm text-blue-600 flex items-center justify-center gap-1 mt-1">
                                <Package className="w-4 h-4" />
                                Total Transaksi
                            </div>
                        </div>

                        <div className="bg-green-50 bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200 shadow-sm">
                            <div className="text-2xl font-bold text-green-700">
                                {formatCurrency(stats.todayRevenue)}
                            </div>
                            <div className="text-sm text-green-600 flex items-center justify-center gap-1 mt-1">
                                <DollarSign className="w-4 h-4" />
                                Pendapatan
                            </div>
                        </div>

                        <div className="bg-purple-50 bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200 shadow-sm">
                            <div className="text-2xl font-bold text-purple-700">
                                {stats.completedToday}
                            </div>
                            <div className="text-sm text-purple-600 flex items-center justify-center gap-1 mt-1">
                                <CheckCircle className="w-4 h-4" />
                                Selesai
                            </div>
                        </div>

                        <div className="bg-orange-50 bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200 shadow-sm">
                            <div className="text-2xl font-bold text-orange-700">
                                {stats.inProgress}
                            </div>
                            <div className="text-sm text-orange-600 flex items-center justify-center gap-1 mt-1">
                                <Clock className="w-4 h-4" />
                                Dalam Proses
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Refresh Button */}
            <button
                onClick={() => fetchDashboardData()}
                disabled={loading}
                className="fixed bottom-24 right-4 bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200 z-10 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default Dashboard;