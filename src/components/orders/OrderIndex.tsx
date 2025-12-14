// src/components/orders/OrderIndex.tsx
import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { Link } from 'react-router-dom';
import { type OrderStatus } from '../../types/order';

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

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [fetchOrders, fetchStats]);

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
            'request': 'bg-blue-100 text-blue-800',
            'washing': 'bg-yellow-100 text-yellow-800',
            'drying': 'bg-orange-100 text-orange-800',
            'ironing': 'bg-purple-100 text-purple-800',
            'ready': 'bg-green-100 text-green-800',
            'completed': 'bg-green-500 text-white',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentBadge = (status: 'pending' | 'paid') => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getStatusLabel = (status: OrderStatus) => {
        const labels: Record<OrderStatus, string> = {
            'request': 'Penerimaan',
            'washing': 'Pencucian',
            'drying': 'Pengeringan',
            'ironing': 'Setrika',
            'ready': 'Siap Diambil',
            'completed': 'Selesai',
        };
        return labels[status] || status;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <List className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Daftar Order
                </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <Package className="w-3 h-3" />
                        Total Order
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-100">
                    <div className="text-lg font-bold text-green-600">
                        {formatCurrency(stats.revenue)}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <DollarSign className="w-3 h-3" />
                        Pendapatan
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        Selesai
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value })}
                        placeholder="Cari order (No. Order / Nama Pelanggan)..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Periode
                        </label>
                        <select
                            value={filters.dateFilter}
                            onChange={(e) => setFilters({ dateFilter: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                            {dateOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Filter className="w-3 h-3" />
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ status: e.target.value as OrderStatus | '' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
                className="inline-flex w-full bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
                <Plus className="w-5 h-5" />
                Buat Order Baru
            </Link>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 bg-linear-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && !orders.length ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                                <div className="h-8 w-8 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                    <List className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {filters.search || filters.status !== '' || filters.dateFilter !== 'all'
                            ? 'Tidak ditemukan order'
                            : 'Belum ada order'
                        }
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {filters.search || filters.status !== '' || filters.dateFilter !== 'all'
                            ? 'Coba ubah filter pencarian Anda'
                            : 'Mulai dengan membuat order pertama'
                        }
                    </p>
                    <Link
                        to="/orders/create"
                        className="bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Order Pertama
                    </Link>
                </div>
            ) : (
                <>
                    {/* Orders List */}
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-4 border border-gray-200 hover:border-blue-200"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadge(order.payment_status)}`}>
                                                {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            {formatCurrency(order.total_amount)}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mb-3">
                                    {order.order_items.slice(0, 2).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex justify-between text-sm py-1 ${index > 0 ? 'border-t border-gray-100' : ''}`}
                                        >
                                            <span className="text-gray-600 truncate flex-1 mr-2">
                                                {item.service.name} ({item.quantity}x)
                                            </span>
                                            <span className="font-medium whitespace-nowrap">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                    {order.order_items.length > 2 && (
                                        <div className="text-xs text-gray-500 text-center mt-1">
                                            +{order.order_items.length - 2} layanan lainnya
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Detail
                                    </Link>
                                    <Link
                                        to={`/process?search=${order.order_number}`}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Proses
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Yakin ingin menghapus order ${order.order_number}?`)) {
                                                deleteOrder(order.id);
                                            }
                                        }}
                                        disabled={loading}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Hapus
                                    </button>
                                </div>

                                {/* Estimated Completion */}
                                {order.estimated_completion && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Perkiraan Selesai:</span>
                                            <span className={`font-medium ${
                                                new Date(order.estimated_completion) < new Date() && order.status !== 'completed'
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}>
                                                {formatDate(order.estimated_completion)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                <span>
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
                                        className="px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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
                                                className={`px-3 py-2 border ${
                                                    pagination.currentPage === pageNum
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                } transition duration-200`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPage(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                        className="px-3 py-2 border border-gray-300 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                    >
                                        →
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Refresh Button */}
            <button
                onClick={() => fetchOrders()}
                disabled={loading}
                className="fixed bottom-24 right-4 bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200 z-10 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default OrderIndex;