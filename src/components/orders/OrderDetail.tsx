import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { 
    ArrowLeft, FileText, User, Package, 
    CheckCircle, AlertCircle, Printer, CreditCard,
    RefreshCw, Check, Calendar,
} from 'lucide-react';
import { type OrderStatus } from '../../types/order';

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
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    React.useEffect(() => {
        if (id) {
            fetchOrder(parseInt(id));
        }
    }, [id]);

    const statusSteps: Record<OrderStatus, { label: string; icon: string; color: string }> = {
        'request': { label: 'Penerimaan', icon: '📥', color: 'blue' },
        'washing': { label: 'Pencucian', icon: '🧼', color: 'yellow' },
        'drying': { label: 'Pengeringan', icon: '💨', color: 'orange' },
        'ironing': { label: 'Setrika', icon: '👕', color: 'purple' },
        'ready': { label: 'Siap Diambil', icon: '✅', color: 'green' },
        'completed': { label: 'Selesai', icon: '🏁', color: 'green' },
    };

    const statusOrder: OrderStatus[] = ['request', 'washing', 'drying', 'ironing', 'ready', 'completed'];

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

    const getStatusBadge = (status: OrderStatus) => {
        const badges: Record<OrderStatus, string> = {
            'request': 'bg-blue-100 text-blue-800',
            'washing': 'bg-yellow-100 text-yellow-800',
            'drying': 'bg-orange-100 text-orange-800',
            'ironing': 'bg-purple-100 text-purple-800',
            'ready': 'bg-green-100 text-green-800',
            'completed': 'bg-green-500 text-white',
        };
        return badges[status];
    };

    const getPaymentBadge = (status: 'pending' | 'paid') => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getNextStatus = (): OrderStatus | null => {
        if (!currentOrder) return null;
        const currentIndex = statusOrder.indexOf(currentOrder.status);
        return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
    };

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        if (!currentOrder || !id) return;

        // Validate status progression
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
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!currentOrder || !id) return;
        await updatePaymentStatus(parseInt(id), 'paid');
        setShowConfirmPayment(false);
    };

    const handleMarkAsCompleted = async () => {
        if (!currentOrder || !id) return;
        
        if (currentOrder.status !== 'ready') {
            alert('Order belum siap untuk diselesaikan! Pastikan status sudah "Siap Diambil" terlebih dahulu.');
            return;
        }

        await updateOrderStatus(parseInt(id), 'completed');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !currentOrder) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error || 'Order tidak ditemukan'}
            </div>
        );
    }

    const nextStatus = getNextStatus();
    const currentStatusIndex = statusOrder.indexOf(currentOrder.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <Link to="/orders" className="text-blue-500 hover:text-blue-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-blue-700">Detail Order</h1>
                    <p className="text-gray-600">{currentOrder.order_number}</p>
                </div>
            </div>

            {/* Order Status & Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-blue-700">Status Order</h2>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(currentOrder.status)}`}>
                                {statusSteps[currentOrder.status].label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadge(currentOrder.payment_status)}`}>
                                {currentOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Dibuat</p>
                        <p className="text-sm font-medium">{formatDate(currentOrder.created_at)}</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex items-center relative min-w-max px-2">
                        {statusOrder.map((status, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = status === currentOrder.status;
                            
                            return (
                                <React.Fragment key={status}>
                                    <div className="flex flex-col items-center mt-2 z-10 min-w-[70px]">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-300
                                            ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                                            ${isCurrent ? 'ring-2 ring-green-400 ring-offset-2 scale-110' : ''}`}>
                                            {isCompleted ? (
                                                <span className="text-lg">{statusSteps[status].icon}</span>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span className={`text-xs mt-1 text-center ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                            {statusSteps[status].label}
                                        </span>
                                    </div>
                                    {index < statusOrder.length - 1 && (
                                        <div className={`h-1 mx-2 -mt-5 min-w-[40px] transition-all duration-300
                                            ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'}`}>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                {currentOrder.status !== 'completed' && (
                    <div className="border-t pt-6">
                        <h3 className="text-md font-semibold text-gray-700 mb-4">Aksi Cepat</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {nextStatus && (
                                <button
                                    onClick={() => handleUpdateStatus(nextStatus)}
                                    disabled={isUpdatingStatus}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                    {isUpdatingStatus ? 'Loading...' : `Ke ${statusSteps[nextStatus].label}`}
                                </button>
                            )}

                            {currentOrder.payment_status === 'pending' && (
                                <button
                                    onClick={() => setShowConfirmPayment(true)}
                                    disabled={isUpdatingStatus}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-3 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Tandai Lunas
                                </button>
                            )}

                            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-2">
                                <Printer className="w-4 h-4" />
                                Print Nota
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Pelanggan
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">{currentOrder.customer.name}</span>
                    </div>
                    {currentOrder.customer.phone && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Telepon:</span>
                            <a href={`tel:${currentOrder.customer.phone}`} className="font-medium text-blue-600 hover:text-blue-700">
                                {currentOrder.customer.phone}
                            </a>
                        </div>
                    )}
                    {currentOrder.customer.address && (
                        <div className="flex flex-col">
                            <span className="text-gray-600 mb-1">Alamat:</span>
                            <span className="font-medium">{currentOrder.customer.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Detail Layanan
                </h2>
                <div className="space-y-4">
                    {currentOrder.order_items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.service.name}</h3>
                                    <p className="text-sm text-gray-600">{item.service.category}</p>
                                    {item.service.duration && (
                                        <p className="text-xs text-gray-500">{item.service.duration}</p>
                                    )}
                                    {item.notes && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            <FileText className="w-4 h-4 inline mr-1" />
                                            {item.notes}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {item.quantity} x {formatCurrency(item.unit_price)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-green-600">{formatCurrency(currentOrder.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Notes & Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informasi Order
                </h2>
                <div className="space-y-4">
                    {currentOrder.notes && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Catatan Order:</h3>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{currentOrder.notes}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Metode Bayar
                            </h3>
                            <p className="text-gray-900">{currentOrder.payment_method === 'cash' ? 'Tunai' : 'Transfer'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Status Bayar</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadge(currentOrder.payment_status)}`}>
                                {currentOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>
                        </div>
                    </div>

                    {currentOrder.estimated_completion && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Perkiraan Selesai
                            </h3>
                            <p className="text-gray-900">{formatDate(currentOrder.estimated_completion)}</p>
                        </div>
                    )}

                    {currentOrder.weight && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Berat</h3>
                            <p className="text-gray-900">{currentOrder.weight} kg</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    to="/orders"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 text-center flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>

                {currentOrder.status === 'ready' ? (
                    <button
                        onClick={handleMarkAsCompleted}
                        disabled={isUpdatingStatus}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {isUpdatingStatus ? 'Loading...' : 'Tandai Selesai'}
                    </button>
                ) : currentOrder.status === 'completed' ? (
                    <div className="bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Order Selesai
                    </div>
                ) : (
                    <button
                        onClick={() => alert(`Order harus dalam status SIAP DIAMBIL sebelum bisa ditandai selesai.\n\nStatus saat ini: ${statusSteps[currentOrder.status].label}`)}
                        className="bg-gray-300 cursor-not-allowed text-gray-600 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Tandai Selesai
                    </button>
                )}
            </div>

            {/* Confirm Payment Modal */}
            {showConfirmPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Pembayaran</h3>
                        <p className="text-gray-600 mb-4">
                            Apakah Anda yakin ingin menandai order ini sebagai LUNAS?
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>No. Order:</span>
                                <span className="font-medium">{currentOrder.order_number}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-green-600">{formatCurrency(currentOrder.total_amount)}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={isUpdatingStatus}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                {isUpdatingStatus ? 'Processing...' : 'Ya, Tandai Lunas'}
                            </button>
                            <button
                                onClick={() => setShowConfirmPayment(false)}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;