// src/components/orders/OrderDetail.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import Invoice from './Invoice';
import {
    ArrowLeft, FileText, User, Package,
    CheckCircle, AlertCircle, Printer, CreditCard,
    RefreshCw,
    Zap, Play, DollarSign,
    Scale, Clock, Home,
    X,
    // CircleEllipsis
} from 'lucide-react';
import { calculateTotalCustomItems, hasCustomItems, parseCustomItems, type OrderStatus } from '../../types/order';

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const {
        currentOrder,
        loading,
        error,
        fetchOrder,
        updateOrderStatus,
        updatePaymentStatus,
    } = useOrderStore();

    const [showConfirmPayment, setShowConfirmPayment] = useState(false);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showFABMenu, setShowFABMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'items' | 'notes'>('info');

    React.useEffect(() => {
        if (id) {
            fetchOrder(parseInt(id));
        }
    }, [id]);

    const statusSteps: Record<OrderStatus, { label: string; icon: string; color: string }> = {
        'request': { label: 'Penerimaan', icon: '📥', color: 'sky' },
        'washing': { label: 'Pencucian', icon: '🧼', color: 'amber' },
        'drying': { label: 'Pengeringan', icon: '💨', color: 'orange' },
        'ironing': { label: 'Setrika', icon: '👕', color: 'purple' },
        'ready': { label: 'Siap Diambil', icon: '✅', color: 'green' },
        'completed': { label: 'Selesai', icon: '🏁', color: 'green' },
        'cancelled': { label: 'Dibatalkan', icon: '❌', color: 'red' },
    };

    const statusOrder: OrderStatus[] = ['request', 'washing', 'drying', 'ironing', 'ready', 'completed'];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // const formatTime = (dateString: string) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleTimeString('id-ID', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //     });
    // };

    const getStatusBadge = (status: OrderStatus) => {
        const badges: Record<OrderStatus, string> = {
            'request': 'bg-sky-100 text-sky-800 border border-sky-300',
            'washing': 'bg-amber-100 text-amber-800 border border-amber-300',
            'drying': 'bg-orange-100 text-orange-800 border border-orange-300',
            'ironing': 'bg-purple-100 text-purple-800 border border-purple-300',
            'ready': 'bg-green-100 text-green-800 border border-green-300',
            'completed': 'bg-green-500 text-white border border-green-600',
            'cancelled': 'bg-red-500 text-red-200 border border-red-600',
        };
        return badges[status];
    };

    const getPaymentBadge = (status: 'pending' | 'paid' | 'partial' | 'cancelled') => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300';
    };

    const getNextStatus = (): OrderStatus | null => {
        if (!currentOrder) return null;
        const currentIndex = statusOrder.indexOf(currentOrder.status);
        return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
    };

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        if (!currentOrder || !id) return;

        const currentIndex = statusOrder.indexOf(currentOrder.status);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex > currentIndex + 1) {
            const nextStep = statusOrder[currentIndex + 1];
            alert(`Tidak bisa melompat ke ${statusSteps[newStatus].label}. Harus melalui ${statusSteps[nextStep].label} terlebih dahulu.`);
            return;
        }

        setIsUpdatingStatus(true);
        try {
            await updateOrderStatus(parseInt(id), newStatus);
            setShowFABMenu(false);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!currentOrder || !id) return;

        // Validasi file upload
        if (!paymentProofFile) {
            alert('Silakan upload bukti pembayaran terlebih dahulu');
            return;
        }

        try {
            setIsUpdatingStatus(true);

            // Upload file dan update status
            await updatePaymentStatus(parseInt(id), 'paid', paymentProofFile);

            // Success feedback
            alert('✅ Pembayaran berhasil dikonfirmasi dan bukti tersimpan!');

            // Reset state
            setShowConfirmPayment(false);
            setPaymentProofFile(null);
            setPaymentProofPreview(null);
            setShowFABMenu(false);

        } catch (error) {
            console.error('Error marking as paid:', error);
            alert('❌ Gagal mengupdate status pembayaran. Silakan coba lagi.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!currentOrder || !id) return;

        if (currentOrder.status !== 'ready') {
            alert('Order belum siap untuk diselesaikan! Pastikan status sudah "Siap Diambil" terlebih dahulu.');
            return;
        }

        await updateOrderStatus(parseInt(id), 'completed');
        setShowFABMenu(false);
    };

    const handlePrint = () => {
        setShowInvoice(true);
        // setTimeout(() => {
        //     window.print();
        // }, 100);
        setShowFABMenu(false);
    };

    const quickActions = [
        {
            id: 'next',
            label: 'Lanjut Step',
            icon: Play,
            color: 'bg-gradient-to-br from-sky-500 to-sky-600',
            visible: () => !!getNextStatus() && currentOrder?.status !== 'completed',
            action: () => getNextStatus() && handleUpdateStatus(getNextStatus()!)
        },
        {
            id: 'paid',
            label: 'Tandai Lunas',
            icon: DollarSign,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            visible: () => currentOrder?.payment_status === 'pending',
            action: () => setShowConfirmPayment(true)
        },
        {
            id: 'print',
            label: 'Print Nota',
            icon: Printer,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            visible: () => true,
            action: handlePrint
        },
        {
            id: 'complete',
            label: 'Selesaikan',
            icon: CheckCircle,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            visible: () => currentOrder?.status === 'ready',
            action: handleMarkAsCompleted
        },
    ];

    const visibleActions = quickActions.filter(action => action.visible());

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
                    <p className="text-sky-600 font-medium">Memuat detail order...</p>
                </div>
            </div>
        );
    }

    if (error || !currentOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 flex items-center justify-center">
                <div className="w-full max-w-sm">
                    <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-sm">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                            {error || 'Order tidak ditemukan'}
                        </h3>
                        <Link
                            to="/orders"
                            className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-4"
                        >
                            Kembali ke Daftar Order
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // const nextStatus = getNextStatus();
    const currentStatusIndex = statusOrder.indexOf(currentOrder.status);
    const progressPercentage = ((currentStatusIndex + 1) / statusOrder.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            {/* App Header */}
            <div className=" bg-white border-b border-sky-200 px-4 py-3 ">
                <div className="flex items-center gap-3">
                    <Link
                        to="/orders"
                        className="text-sky-600 hover:text-sky-700 p-2 hover:bg-sky-50 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-sm text-gray-600 font-medium">Order Detail</h1>
                                <p className="text-base font-bold text-gray-900">{currentOrder.order_number}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(currentOrder.status)}`}>
                                    {statusSteps[currentOrder.status].label}
                                </span>
                                <span className={`px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold ${getPaymentBadge(currentOrder.payment_status)}`}>
                                    {currentOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex mt-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 pb-3 text-center transition-all relative ${activeTab === 'info' ? 'text-sky-600' : 'text-gray-500'}`}
                    >
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Info</span>
                        {activeTab === 'info' && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex-1 pb-3 text-center transition-all relative ${activeTab === 'items' ? 'text-sky-600' : 'text-gray-500'}`}
                    >
                        <Package className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Items</span>
                        {activeTab === 'items' && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 pb-3 text-center transition-all relative ${activeTab === 'notes' ? 'text-sky-600' : 'text-gray-500'}`}
                    >
                        <FileText className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Catatan</span>
                        {activeTab === 'notes' && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 pb-24">
                {/* Tab 1: Info */}
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        {/* Progress Card */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-sky-600" />
                                    <h3 className="text-sm font-bold text-gray-800">Progress Order</h3>
                                </div>
                                <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded">
                                    {currentStatusIndex + 1}/{statusOrder.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-700"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-gray-600">
                                    <div className="text-center flex-1">
                                        <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-300 mx-auto mb-1 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-sky-700">1</span>
                                        </div>
                                        <span className="font-medium">Mulai</span>
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 border-2 border-sky-600 mx-auto mb-1 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{currentStatusIndex + 1}</span>
                                        </div>
                                        <span className="font-medium text-sky-700">{statusSteps[currentOrder.status].label}</span>
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-300 mx-auto mb-1 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-green-700">{statusOrder.length}</span>
                                        </div>
                                        <span className="font-medium">Selesai</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-sky-600" />
                                <h3 className="text-sm font-bold text-gray-800">Informasi Pelanggan</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">Nama</p>
                                        <p className="text-sm font-bold text-gray-900">{currentOrder.customer.name}</p>
                                    </div>
                                </div>

                                {currentOrder.customer.phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📱</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Telepon</p>
                                            <a
                                                href={`tel:${currentOrder.customer.phone}`}
                                                className="text-sm font-bold text-sky-600 hover:text-sky-700"
                                            >
                                                {currentOrder.customer.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Scale className="w-4 h-4 text-sky-600" />
                                <h3 className="text-sm font-bold text-gray-800">Ringkasan Order</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Item</p>
                                            <p className="text-sm font-bold text-gray-900">{currentOrder.order_items.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {currentOrder.weight && (
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <Scale className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Berat Total</p>
                                                <p className="text-sm font-bold text-gray-900">{currentOrder.weight} kg</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold text-gray-800">Total Biaya</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(currentOrder.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Items */}
                {/* Tab 2: Items */}
                {activeTab === 'items' && (
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-sky-600" />
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">Detail Layanan</h3>
                                        <p className="text-xs text-gray-500">{currentOrder.order_items.length} item</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                            {currentOrder.order_items.map((item) => {
                                // GUNAKAN HELPER FUNCTION
                                const customItems = parseCustomItems(item.custom_items);
                                const totalCustomItems = calculateTotalCustomItems(item.custom_items);
                                const hasItems = hasCustomItems(item);

                                return (
                                    <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg">
                                                            {item.service.category === 'pakaian' ? '👕' : '🛏️'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-gray-900">{item.service.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{item.service.category}</p>
                                                        {item.service.duration && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">{item.service.duration}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Custom Items Detail - MENGGUNAKAN HELPER */}
                                                {hasItems && (
                                                    <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="w-3 h-3 text-sky-600" />
                                                            <p className="text-xs font-bold text-sky-800">Detail Barang:</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {customItems.map((customItem, idx) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white px-2 py-1.5 rounded">
                                                                    <span className="text-xs text-gray-700">{customItem.name || 'Barang'}</span>
                                                                    <span className="text-xs font-bold text-sky-700">{customItem.quantity || 0} pcs</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between items-center bg-sky-100 px-2 py-1.5 rounded mt-1 border-t border-sky-300">
                                                                <span className="text-xs font-bold text-sky-800">Total Item:</span>
                                                                <span className="text-xs font-bold text-sky-800">{totalCustomItems} pcs</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.notes && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="flex items-start gap-2">
                                                            <FileText className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                                            <p className="text-xs text-blue-700">{item.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                {item.service.is_weight_based
                                                    ? `${item.weight} kg × ${formatCurrency(item.unit_price)}/kg`
                                                    : `${item.quantity} pcs × ${formatCurrency(item.unit_price)}/pcs`
                                                }
                                            </div>
                                            <div className="text-base font-bold text-green-600">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Total Order</p>
                                    <p className="text-xs text-green-600">{currentOrder.order_items.length} layanan</p>
                                    <p className="text-xs text-green-600">{currentOrder.total_items} total barang</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-700">
                                        {formatCurrency(currentOrder.total_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Notes */}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        {/* Order Notes */}
                        {currentOrder.notes && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-sky-600" />
                                    <h3 className="text-sm font-bold text-gray-800">Catatan Order</h3>
                                </div>
                                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                                    <p className="text-sm text-gray-700 leading-relaxed">{currentOrder.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="w-5 h-5 text-sky-600" />
                                <h3 className="text-sm font-bold text-gray-800">Informasi Pembayaran</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Metode Bayar</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {currentOrder.payment_method === 'cash' ? 'Tunai' : 'Transfer'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentOrder.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            {currentOrder.payment_status === 'paid' ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status Bayar</p>
                                            <p className={`text-sm font-bold ${currentOrder.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {currentOrder.estimated_completion && (
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Estimasi Selesai</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {(new Date(currentOrder.estimated_completion).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        {currentOrder.customer.address && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Home className="w-5 h-5 text-sky-600" />
                                    <h3 className="text-sm font-bold text-gray-800">Alamat Pengambilan</h3>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-700">{currentOrder.customer.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-6 mb-6">
                    <Link
                        to="/orders"
                        className="block w-full text-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-300 transition-colors"
                    >
                        Kembali ke Daftar Order
                    </Link>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-20 right-2 z-50">
                {/* Quick Action Buttons */}
                {showFABMenu && (
                    <div className="flex flex-col items-end gap-3 mb-3">
                        {visibleActions.map((action, index) => (
                            <div
                                key={action.id}
                                className="flex items-center gap-2 animate-fadeInUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="bg-white px-4 py-2 rounded-xl text-sm font-medium text-gray-800 shadow-lg border border-gray-200">
                                    {action.label}
                                </span>
                                <button
                                    onClick={action.action}
                                    className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center`}
                                >
                                    <action.icon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main FAB */}
                <button
                    onClick={() => setShowFABMenu(!showFABMenu)}
                    className={`w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${showFABMenu ? 'rotate-45 scale-110' : ''
                        }`}
                >
                    {showFABMenu ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Zap className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Confirm Payment Modal dengan Upload Bukti */}
            {showConfirmPayment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Pembayaran</h3>
                            <p className="text-sm text-gray-600">
                                Upload bukti pembayaran untuk order ini
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Info Order - Read Only */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">No. Order</span>
                                    <span className="text-sm font-bold text-gray-900">{currentOrder.order_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Customer</span>
                                    <span className="text-sm font-bold text-gray-900">{currentOrder.customer.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Metode Bayar</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {currentOrder.payment_method === 'cash' ? 'Tunai' : 'Transfer'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-300">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {formatCurrency(currentOrder.total_amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Upload Bukti Pembayaran */}
                            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                <label className="block text-sm font-bold text-green-800 mb-2">
                                    Upload Bukti Pembayaran *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPaymentProofFile(file);

                                            // Create preview for images
                                            if (file.type.startsWith('image/')) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => setPaymentProofPreview(e.target?.result as string);
                                                reader.readAsDataURL(file);
                                            } else {
                                                setPaymentProofPreview(null);
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Format: JPG, PNG, PDF (Max 5MB)
                                </p>

                                {/* Preview */}
                                {paymentProofPreview && (
                                    <div className="mt-3">
                                        <img
                                            src={paymentProofPreview}
                                            alt="Preview Bukti"
                                            className="max-w-full h-40 object-contain rounded-lg border-2 border-green-300 mx-auto"
                                        />
                                    </div>
                                )}

                                {paymentProofFile && !paymentProofPreview && (
                                    <div className="mt-3 bg-white rounded-lg p-3 border border-green-300">
                                        <p className="text-sm text-gray-700">
                                            📄 {paymentProofFile.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmPayment(false);
                                        setPaymentProofFile(null);
                                        setPaymentProofPreview(null);
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!paymentProofFile) {
                                            alert('Silakan upload bukti pembayaran terlebih dahulu');
                                            return;
                                        }

                                        // TODO: Implement upload logic with file
                                        await handleMarkAsPaid();
                                        setPaymentProofFile(null);
                                        setPaymentProofPreview(null);
                                    }}
                                    disabled={isUpdatingStatus || !paymentProofFile}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingStatus ? 'Processing...' : 'Konfirmasi Lunas'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Print Preview - Hidden on screen, visible on print */}
            {showInvoice && (
                <div className="fixed inset-0 bg-white z-[100] overflow-auto print-only">
                    <Invoice order={currentOrder} />
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default OrderDetail;