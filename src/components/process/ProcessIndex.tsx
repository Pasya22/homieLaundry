// src/components/process/ProcessIndex.tsx
import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Eye, CheckCircle, ArrowRight, AlertCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { processService, type ProcessUpdateData } from '../../services/processService';
import { type Order, type OrderStatus } from '../../types/order';

const ProcessIndex: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updateData, setUpdateData] = useState<ProcessUpdateData>({
        status: '',
        notes: '',
        estimated_completion: ''
    });

    const statusOptions: Record<OrderStatus, { label: string; icon: string; color: string }> = {
        'request': { label: 'Penerimaan', icon: '📥', color: 'sky' },
        'washing': { label: 'Pencucian', icon: '🧼', color: 'amber' },
        'drying': { label: 'Pengeringan', icon: '💨', color: 'orange' },
        'ironing': { label: 'Setrika', icon: '👕', color: 'purple' },
        'ready': { label: 'Siap Diambil', icon: '✅', color: 'green' },
        'completed': { label: 'Selesai', icon: '🏁', color: 'green' },
        'cancelled': { label: 'Dibatalkan', icon: '❌', color: 'red' },
    };

    useEffect(() => {
        fetchOrders();
    }, [search, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const filters: any = { search };

            if (statusFilter) {
                filters.status = statusFilter;
            }

            const { data } = await processService.getOrders(filters);
            setOrders(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const openUpdateModal = (order: Order) => {
        setSelectedOrder(order);
        setUpdateData({
            status: order.status,
            notes: '',
            estimated_completion: order.estimated_completion || ''
        });
        setShowModal(true);
    };

    const handleQuickUpdate = async (id: number) => {
        setLoading(true);
        try {
            await processService.quickUpdate(id);
            fetchOrders();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal update status');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsReady = async (id: number) => {
        setLoading(true);
        try {
            await processService.markAsReady(id);
            fetchOrders();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal update status');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = async (id: number) => {
        setLoading(true);
        try {
            await processService.markAsCompleted(id);
            fetchOrders();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal update status');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setLoading(true);
        try {
            await processService.updateStatus(selectedOrder.id, updateData);
            setShowModal(false);
            fetchOrders();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal update status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: OrderStatus) => {
        const option = statusOptions[status];
        return `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-200`;
    };

    // ✅ Helper function untuk cek apakah pembayaran sudah lunas
    const isPaymentPaid = (order: Order): boolean => {
        return order.payment_status === 'paid';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6 bg-gradient-to-br from-sky-50 to-white min-h-screen p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
                    <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    Update Proses Laundry
                </h1>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-sky-100">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari order..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!statusFilter
                            ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                            : 'bg-sky-50 text-sky-700 border-2 border-sky-200 hover:bg-sky-100'
                            }`}
                    >
                        Semua Status
                    </button>
                    {Object.entries(statusOptions).map(([value, { label, icon }]) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${statusFilter === value
                                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                                : 'bg-sky-50 text-sky-700 border-2 border-sky-200 hover:bg-sky-100'
                                }`}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {loading && !orders.length ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-sky-100">
                        <RefreshCw className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
                        <p className="text-sky-600 font-bold">Memuat data...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-sky-100">
                        <RefreshCw className="w-20 h-20 text-sky-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-sky-700 mb-2">Tidak ada order</h3>
                        <p className="text-sky-500">
                            {statusFilter
                                ? `Tidak ada order dengan status ${statusOptions[statusFilter as OrderStatus]?.label}`
                                : 'Belum ada order yang tersedia'
                            }
                        </p>
                    </div>
                ) : (
                    orders.map(order => {
                        const isPaid = isPaymentPaid(order);

                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border-2 border-sky-100 hover:border-sky-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-sky-900 text-lg">{order.order_number}</h3>
                                        <p className="text-sm text-sky-600 font-medium">{order.customer.name}</p>
                                        <p className="text-xs text-sky-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusBadge(order.status)} shadow-sm`}>
                                            {statusOptions[order.status].icon} {statusOptions[order.status].label}
                                        </span>
                                        <p className="text-xs text-green-600 font-bold mt-2">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                        {/* ✅ Payment Status Badge */}
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${isPaid
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                            }`}>
                                            {isPaid ? '✓ Lunas' : '⏳ Belum Lunas'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mb-3 text-sm bg-sky-50 rounded-xl p-3 border border-sky-100">
                                    {order.order_items.slice(0, 2).map((item, idx) => (
                                        <div key={item.id} className={`text-sky-700 font-medium ${idx > 0 ? 'border-t border-sky-200 pt-2 mt-2' : ''}`}>
                                            {item.service.name} ({item.quantity}x)
                                        </div>
                                    ))}
                                    {order.order_items.length > 2 && (
                                        <div className="text-xs text-sky-600 text-center mt-2 font-medium">
                                            +{order.order_items.length - 2} layanan lainnya
                                        </div>
                                    )}
                                </div>

                                {/* ✅ Warning jika belum lunas */}
                                {!isPaid && order.status !== 'completed' && order.status !== 'cancelled' && (
                                    <div className="mb-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                                        <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-yellow-700">
                                            <p className="font-bold">Pembayaran Belum Lunas</p>
                                            <p>Order tidak bisa ditandai "Siap" sebelum pembayaran lunas</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleQuickUpdate(order.id)}
                                        disabled={loading || order.status === 'completed' || order.status === 'cancelled'}
                                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        Next Step
                                    </button>

                                    {/* ✅ PERBAIKAN: Tombol Siap hanya muncul jika LUNAS */}
                                    {isPaid &&
                                        order.status === 'ironing' && (
                                            <button
                                                onClick={() => handleMarkAsReady(order.id)}
                                                disabled={loading}
                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Siap
                                            </button>
                                        )}

                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => handleMarkAsCompleted(order.id)}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            Selesai
                                        </button>
                                    )}

                                    <button
                                        onClick={() => openUpdateModal(order)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        Detail
                                    </button>

                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Update Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-sky-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-sky-200">
                        <div className="p-6 border-b-2 border-sky-100 bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-white">Update Status Order</h2>
                            <p className="text-sm text-sky-100 mt-1">
                                {selectedOrder.order_number} - {selectedOrder.customer.name}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitUpdate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">Status Baru</label>
                                <select
                                    value={updateData.status}
                                    onChange={e => setUpdateData({ ...updateData, status: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all duration-200 font-medium"
                                >
                                    {Object.entries(statusOptions).map(([value, { label, icon }]) => (
                                        <option key={value} value={value}>{icon} {label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">
                                    Perkiraan Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={updateData.estimated_completion}
                                    onChange={e => setUpdateData({ ...updateData, estimated_completion: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">Catatan</label>
                                <textarea
                                    value={updateData.notes}
                                    onChange={e => setUpdateData({ ...updateData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                                    placeholder="Tambahkan catatan (opsional)"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {loading ? 'Updating...' : '✓ Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    ✕ Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessIndex;