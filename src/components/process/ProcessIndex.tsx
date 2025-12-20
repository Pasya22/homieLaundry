// src/components/process/ProcessIndex.tsx
import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Eye, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
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
        'request': { label: 'Penerimaan', icon: '📥', color: 'blue' },
        'washing': { label: 'Pencucian', icon: '🧼', color: 'yellow' },
        'drying': { label: 'Pengeringan', icon: '💨', color: 'orange' },
        'ironing': { label: 'Setrika', icon: '👕', color: 'purple' },
        'ready': { label: 'Siap Diambil', icon: '✅', color: 'green' },
        'completed': { label: 'Selesai', icon: '🏁', color: 'green' },
    };

    useEffect(() => {
        fetchOrders();
    }, [search, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await processService.getOrders({
                search,
                status: statusFilter
            });
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                    <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700">Update Proses Laundry</h1>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 border">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari order..."
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium ${
                            !statusFilter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Semua Status
                    </button>
                    {Object.entries(statusOptions).map(([value, { label }]) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium ${
                                statusFilter === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {loading && !orders.length ? (
                    <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-600">Memuat data...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada order</h3>
                        <p className="text-gray-500">Semua order sudah selesai atau belum ada order aktif</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 border">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
                                        {statusOptions[order.status].icon} {statusOptions[order.status].label}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(order.total_amount)}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="mb-3 text-sm text-gray-600">
                                {order.order_items.slice(0, 2).map((item, idx) => (
                                    <div key={item.id} className={idx > 0 ? 'border-t border-gray-100 pt-1' : ''}>
                                        {item.service.name} ({item.quantity}x)
                                    </div>
                                ))}
                                {order.order_items.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center mt-1">
                                        +{order.order_items.length - 2} layanan lainnya
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleQuickUpdate(order.id)}
                                    disabled={loading || order.status === 'completed'}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Next Step
                                </button>

                                {order.status !== 'ready' && order.status !== 'completed' && (
                                    <button
                                        onClick={() => handleMarkAsReady(order.id)}
                                        disabled={loading}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Siap
                                    </button>
                                )}

                                {order.status === 'ready' && (
                                    <button
                                        onClick={() => handleMarkAsCompleted(order.id)}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                                    >
                                        Selesai
                                    </button>
                                )}

                                <button
                                    onClick={() => openUpdateModal(order)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                    Detail
                                </button>

                                <Link
                                    to={`/orders/${order.id}`}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    Lihat
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Update Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold text-blue-700">Update Status Order</h2>
                            <p className="text-sm text-gray-600">
                                {selectedOrder.order_number} - {selectedOrder.customer.name}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitUpdate} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                                <select
                                    value={updateData.status}
                                    onChange={e => setUpdateData({ ...updateData, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.entries(statusOptions).map(([value, { label }]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Perkiraan Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={updateData.estimated_completion}
                                    onChange={e => setUpdateData({ ...updateData, estimated_completion: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                <textarea
                                    value={updateData.notes}
                                    onChange={e => setUpdateData({ ...updateData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tambahkan catatan (opsional)"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                                >
                                    Batal
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