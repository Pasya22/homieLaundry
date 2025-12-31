// src/components/orders/OrderIndex.tsx
import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
    List,
    Search,
    Plus,
    Eye,
    RefreshCw,
    Trash2,
    DollarSign,
    Package,
    CheckCircle,
    AlertCircle,
    Filter,
    Calendar,
    MoreVertical,
    X
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { Link } from 'react-router-dom';
import { formatDateOnly, formatRelativeTime, type OrderStatus } from '../../types/order';

const OrderIndex: React.FC = () => {
    const {
        orders,
        stats,
        loading,
        error,
        filters,
        pagination,
        fetchOrders,
        fetchStats,
        setFilters,
        setPage,
        deleteOrder,
    } = useOrderStore();

    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
    const [drawerAnimation, setDrawerAnimation] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('exited');
    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Gunakan useCallback untuk menghindari re-render berlebihan
    const loadData = useCallback(() => {
        fetchOrders();
        fetchStats();
    }, [fetchOrders, fetchStats]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle drawer animation
    useEffect(() => {
        if (showFilterDrawer) {
            setDrawerAnimation('entering');
            setTimeout(() => setDrawerAnimation('entered'), 10);

            // Prevent body scroll when drawer is open
            document.body.style.overflow = 'hidden';
        } else {
            setDrawerAnimation('exiting');
            setTimeout(() => setDrawerAnimation('exited'), 300);

            // Restore body scroll
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showFilterDrawer]);

    // Handle click outside to close drawer
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node) &&
                overlayRef.current && overlayRef.current.contains(event.target as Node)) {
                setShowFilterDrawer(false);
            }
        };

        if (drawerAnimation === 'entered') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [drawerAnimation]);

    // Handler untuk filter search dengan debounce
    const handleSearchChange = useCallback((value: string) => {
        setFilters({ search: value });
    }, [setFilters]);

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'request', label: 'Penerimaan' },
        { value: 'washing', label: 'Pencucian' },
        { value: 'drying', label: 'Pengeringan' },
        { value: 'ironing', label: 'Setrika' },
        { value: 'ready', label: 'Siap Diambil' },
        { value: 'completed', label: 'Selesai' },
    ];

    const dateOptions = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'yesterday', label: 'Kemarin' },
        { value: 'week', label: 'Minggu Ini' },
        { value: 'month', label: 'Bulan Ini' },
        { value: 'all', label: 'Semua' },
    ];

    const getStatusBadge = (status: OrderStatus) => {
        const badges: Record<OrderStatus, string> = {
            'request': 'bg-blue-100 text-blue-800 border border-blue-200',
            'washing': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'drying': 'bg-orange-100 text-orange-800 border border-orange-200',
            'ironing': 'bg-purple-100 text-purple-800 border border-purple-200',
            'ready': 'bg-green-100 text-green-800 border border-green-200',
            'completed': 'bg-green-500 text-white border border-green-600',
            'cancelled': 'bg-red-500 text-red-200 border border-red-600',

        };
        return badges[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    const getPaymentBadge = (status: 'pending' | 'paid' | 'partial' | 'cancelled') => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200';
    };

    const getStatusLabel = (status: OrderStatus) => {
        const labels: Record<OrderStatus, string> = {
            'request': 'Penerimaan',
            'washing': 'Pencucian',
            'drying': 'Pengeringan',
            'ironing': 'Setrika',
            'ready': 'Siap Diambil',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan',
        };
        return labels[status] || status;
    };

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

    // const formatDate = (dateString: string) => {
    //     const date = new Date(dateString);
    //     const now = new Date();
    //     const diffTime = Math.abs(now.getTime() - date.getTime());
    //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    //     if (diffDays === 0) {
    //         return date.toLocaleTimeString('id-ID', {
    //             hour: '2-digit',
    //             minute: '2-digit'
    //         });
    //     } else if (diffDays === 1) {
    //         return 'Kemarin';
    //     } else if (diffDays <= 7) {
    //         return date.toLocaleDateString('id-ID', { weekday: 'short' });
    //     } else {
    //         return date.toLocaleDateString('id-ID', {
    //             day: '2-digit',
    //             month: '2-digit'
    //         });
    //     }
    // };

    const handleApplyFilter = (type: 'status' | 'date', value: string) => {
        if (type === 'status') {
            setFilters({ status: value as OrderStatus | '' });
        } else {
            setFilters({ dateFilter: value });
        }
        setShowFilterDrawer(false);
    };

    return (
        <div className="space-y-5 bg-gradient-to-br from-sky-50 to-white min-h-screen p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
                        <List className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-sky-900">
                            Daftar Order
                        </h1>
                        <p className="text-xs md:text-sm text-sky-500">
                            Total {stats.total} order
                        </p>
                    </div>
                </div>

                {/* Desktop Filter Button */}
                <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="md:hidden flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Mobile Filter Drawer with Smooth Animation */}
            {(showFilterDrawer || drawerAnimation !== 'exited') && (
                <div
                    ref={overlayRef}
                    className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${drawerAnimation === 'entered'
                        ? 'bg-black/50 backdrop-blur-sm'
                        : drawerAnimation === 'entering'
                            ? 'bg-black/0 backdrop-blur-0'
                            : 'bg-black/0 backdrop-blur-0'
                        }`}
                    onClick={() => setShowFilterDrawer(false)}
                >
                    <div
                        ref={drawerRef}
                        className={`absolute right-0 top-0 h-full w-72 md:w-80 bg-white shadow-2xl transition-transform duration-300 ease-out ${drawerAnimation === 'entered'
                            ? 'translate-x-0'
                            : drawerAnimation === 'entering'
                                ? 'translate-x-full'
                                : 'translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-full flex flex-col overflow-hidden">
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-500 to-sky-600">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Filter className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Filter Order</h3>
                                            <p className="text-sky-100 text-xs">Sesuaikan pencarian</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowFilterDrawer(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>

                                {/* Search in Drawer */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Cari order..."
                                        className="w-full pl-10 pr-4 py-2.5 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white bg-white/90 text-sm placeholder-sky-400"
                                    />
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {/* Status Filter */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                            <span className="text-sky-600 text-sm font-bold">1</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-sky-700">Status Order</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleApplyFilter('status', option.value)}
                                                className={`px-3 py-3 rounded-xl text-xs font-medium border-2 transition-all duration-200 transform hover:-translate-y-0.5 ${filters.status === option.value
                                                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border-sky-500 shadow-lg scale-[1.02]'
                                                    : 'bg-white text-sky-700 border-sky-200 hover:border-sky-300 hover:shadow-md'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Filter */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                            <span className="text-sky-600 text-sm font-bold">2</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-sky-700">Periode Waktu</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {dateOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleApplyFilter('date', option.value)}
                                                className={`px-3 py-3 rounded-xl text-xs font-medium border-2 transition-all duration-200 transform hover:-translate-y-0.5 ${filters.dateFilter === option.value
                                                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border-sky-500 shadow-lg scale-[1.02]'
                                                    : 'bg-white text-sky-700 border-sky-200 hover:border-sky-300 hover:shadow-md'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Filters */}
                                {(filters.status || filters.dateFilter !== 'all') && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                                <span className="text-sky-600 text-sm font-bold">✓</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-sky-700">Filter Aktif</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filters.status && (
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 text-xs font-medium rounded-lg border border-sky-200">
                                                    {statusOptions.find(s => s.value === filters.status)?.label}
                                                </span>
                                            )}
                                            {filters.dateFilter !== 'all' && (
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 text-xs font-medium rounded-lg border border-sky-200">
                                                    {dateOptions.find(d => d.value === filters.dateFilter)?.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-5 border-t border-sky-100 bg-white">
                                <button
                                    onClick={() => {
                                        setFilters({ status: '', dateFilter: 'all', search: '' });
                                        setShowFilterDrawer(false);
                                    }}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 font-semibold rounded-xl border-2 border-sky-200 hover:border-sky-300 hover:bg-sky-200 transition-all duration-200"
                                >
                                    Reset Semua Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats - Mobile First */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center border-2 border-sky-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="text-xl md:text-2xl font-bold text-sky-700">{stats.total}</div>
                    <div className="text-xs md:text-sm text-sky-600 font-medium flex items-center justify-center gap-1 mt-1">
                        <Package className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Total</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center border-2 border-sky-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="text-lg md:text-xl font-bold text-green-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatCurrency(stats.revenue)}
                    </div>
                    <div className="text-xs md:text-sm text-green-600 font-medium flex items-center justify-center gap-1 mt-1">
                        <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Pendapatan</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center border-2 border-sky-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="text-xl md:text-2xl font-bold text-green-700">{stats.completed}</div>
                    <div className="text-xs md:text-sm text-green-600 font-medium flex items-center justify-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Selesai</span>
                    </div>
                </div>
            </div>

            {/* Desktop Search & Filters */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 border-2 border-sky-100 transition-all duration-300 hover:shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Search className="w-4 h-4 text-sky-500" />
                            <label className="text-sm font-semibold text-sky-700">Cari Order</label>
                        </div>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="No. Order / Nama Pelanggan..."
                            className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-sky-500" />
                            <label className="text-sm font-semibold text-sky-700">Periode</label>
                        </div>
                        <select
                            value={filters.dateFilter}
                            onChange={(e) => setFilters({ dateFilter: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white"
                        >
                            {dateOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Filter className="w-4 h-4 text-sky-500" />
                            <label className="text-sm font-semibold text-sky-700">Status</label>
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ status: e.target.value as OrderStatus | '' })}
                            className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Create New Order Button */}
            <Link
                to="/orders/create"
                className="inline-flex w-full md:w-auto md:ml-auto md:max-w-xs bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all duration-300 items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl mb-4 md:mb-6 transform hover:-translate-y-0.5"
            >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Buat Order Baru</span>
            </Link>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 mb-4 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && !orders.length ? (
                <div className="space-y-3 md:space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse border-2 border-sky-100">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="h-4 bg-sky-200 rounded w-1/4 mb-3" />
                                    <div className="h-3 bg-sky-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-sky-200 rounded w-1/2" />
                                </div>
                                <div className="h-8 w-8 bg-sky-200 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-center border-2 border-sky-100 animate-fadeIn">
                    <List className="w-12 h-12 md:w-16 md:h-16 text-sky-300 mx-auto mb-3" />
                    <h3 className="text-lg md:text-xl font-semibold text-sky-900 mb-2">
                        {filters.search || filters.status !== '' || filters.dateFilter !== 'all'
                            ? 'Tidak ditemukan order'
                            : 'Belum ada order'
                        }
                    </h3>
                    <p className="text-sky-500 text-sm md:text-base mb-4">
                        {filters.search || filters.status !== '' || filters.dateFilter !== 'all'
                            ? 'Coba ubah filter pencarian Anda'
                            : 'Mulai dengan membuat order pertama'
                        }
                    </p>
                    <Link
                        to="/orders/create"
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Order Pertama
                    </Link>
                </div>
            ) : (
                <>
                    {/* Orders List */}
                    <div className="space-y-3 md:space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border-2 border-sky-100 hover:border-sky-300 animate-fadeInUp"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                                            <h3 className="font-bold text-sky-900 text-sm md:text-base truncate">
                                                {order.order_number}
                                            </h3>
                                            <div className="flex flex-wrap gap-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${getStatusBadge(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${getPaymentBadge(order.payment_status)}`}>
                                                    {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-sky-600 font-medium truncate">{order.customer.name}</p>
                                        <p className="text-xs text-sky-500">{formatRelativeTime(order.created_at)}</p>
                                    </div>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <div className="text-base md:text-lg font-bold text-green-700 whitespace-nowrap">
                                            {formatCurrency(order.total_amount)}
                                        </div>

                                        {/* Desktop Actions */}
                                        <div className="hidden md:flex gap-2 mt-2">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="text-sky-600 hover:text-sky-700 p-2 hover:bg-sky-50 rounded-lg border border-sky-200 transition-all duration-200 hover:scale-110"
                                                title="Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/process?search=${order.order_number}`}
                                                className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg border border-green-200 transition-all duration-200 hover:scale-110"
                                                title="Proses"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Yakin ingin menghapus order ${order.order_number}?`)) {
                                                        deleteOrder(order.id);
                                                    }
                                                }}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50 transition-all duration-200 hover:scale-110"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Mobile Action Menu */}
                                        <div className="md:hidden relative">
                                            <button
                                                onClick={() => setShowActionMenu(showActionMenu === order.id ? null : order.id)}
                                                className="text-sky-500 hover:text-sky-600 p-2 transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {showActionMenu === order.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border-2 border-sky-100 z-10 animate-scaleIn">
                                                    <div className="p-2">
                                                        <Link
                                                            to={`/orders/${order.id}`}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-sky-700 hover:bg-sky-50 rounded-lg transition-all duration-200"
                                                            onClick={() => setShowActionMenu(null)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>Lihat Detail</span>
                                                        </Link>
                                                        <Link
                                                            to={`/process?search=${order.order_number}`}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                                                            onClick={() => setShowActionMenu(null)}
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                            <span>Update Proses</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Yakin ingin menghapus order ${order.order_number}?`)) {
                                                                    deleteOrder(order.id);
                                                                }
                                                                setShowActionMenu(null);
                                                            }}
                                                            disabled={loading}
                                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Hapus Order</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview - Mobile Only */}
                                <div className="md:hidden mb-3">
                                    <div className="text-xs text-sky-600 font-medium mb-2">Layanan:</div>
                                    {order.order_items.slice(0, 2).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex justify-between text-sm py-1 ${index > 0 ? 'border-t border-sky-100' : ''}`}
                                        >
                                            <span className="text-sky-600 truncate flex-1 mr-2">
                                                {item.service.name} 
                                            </span>
                                            <span className="font-medium text-sky-900 whitespace-nowrap">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                    {order.order_items.length > 2 && (
                                        <div className="text-xs text-sky-400 text-center mt-1">
                                            +{order.order_items.length - 2} layanan lainnya
                                        </div>
                                    )}
                                </div>

                                {/* Estimated Completion - Mobile */}
                                {order.estimated_completion && (
                                    <div className="md:hidden mt-3 pt-3 border-t border-sky-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-sky-600">Estimasi:</span>
                                            {/* <span className={`font-medium transition-colors duration-200 ${new Date(order.estimated_completion) < new Date() && order.status !== 'completed'
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                                }`}>
                                                {formatDate(order.estimated_completion)}
                                            </span> */}

                                            <span>{formatDateOnly(order.estimated_completion)}</span>

                                        </div>
                                    </div>
                                )}

                                {/* Mobile Actions Footer */}
                                <div className="md:hidden flex gap-2 pt-3 border-t border-sky-200">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Detail</span>
                                    </Link>
                                    <Link
                                        to={`/process?search=${order.order_number}`}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Proses</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6 md:mt-8 animate-fadeInUp">
                            <div className="flex flex-col sm:flex-row justify-between items-center text-xs md:text-sm text-sky-500 mb-3 md:mb-4 gap-2">
                                <span className="text-center sm:text-left">
                                    Menampilkan {(pagination.currentPage - 1) * pagination.perPage + 1} -{' '}
                                    {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari{' '}
                                    {pagination.total} order
                                </span>
                                <span>
                                    Halaman {pagination.currentPage} dari {pagination.totalPages}
                                </span>
                            </div>
                            <div className="flex justify-center">
                                <nav className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1 || loading}
                                        className="px-3 py-2 border-2 border-sky-200 rounded-l-xl bg-white text-sky-500 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                    >
                                        ←
                                    </button>

                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                disabled={loading}
                                                className={`px-3 py-2 border-2 text-sm md:text-base transition-all duration-200 ${pagination.currentPage === pageNum
                                                    ? 'border-sky-500 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold scale-105'
                                                    : 'border-sky-200 bg-white text-sky-700 hover:bg-sky-50 hover:scale-105'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPage(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                        className="px-3 py-2 border-2 border-sky-200 rounded-r-xl bg-white text-sky-500 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                    >
                                        →
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Refresh Button with Animation */}
            <button
                onClick={() => loadData()}
                disabled={loading}
                className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-10 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 active:scale-95"
                title="Refresh data"
                aria-label="Refresh orders"
            >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default OrderIndex;