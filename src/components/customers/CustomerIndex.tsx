// src/components/customers/CustomerIndex.tsx
import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Phone,
    MapPin,
    Wallet,
    Calendar,
    Users,
    AlertCircle,
    Crown,
    User,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';
import CustomerModal from './CustomerModal';

const CustomerIndex: React.FC = () => {
    const {
        customers,
        loading,
        error,
        pagination,
        search,
        fetchCustomers,
        setSearch,
        openModal,
        deleteCustomer,
        setPage,
    } = useCustomerStore();

    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(debouncedSearch);
        }, 500);

        return () => clearTimeout(timer);
    }, [debouncedSearch, setSearch]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers, pagination.currentPage, search]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusBadge = (customer: any) => {
        if (customer.type === 'member') {
            if (customer.member_status === 'active') {
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white flex items-center gap-1 shadow-sm">
                        <Crown className="w-3 h-3" />
                        Member Aktif
                    </span>
                );
            }
            return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border-2 border-amber-200">
                    Member Expired
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Regular
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-3 md:p-4 lg:p-6">
            {/* Header - Sky Blue Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl shadow-lg">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                            Manajemen Member
                        </h1>
                        <p className="text-xs md:text-sm text-sky-500">
                            Total {pagination.total ?? customers.length} pelanggan terdaftar
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <input
                    type="text"
                    value={debouncedSearch}
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                    placeholder="Cari nama atau nomor telepon member..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white shadow-sm text-sky-900 placeholder-sky-400"
                />
            </div>

            {/* Add Button */}
            <button
                onClick={() => openModal()}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl mb-6"
            >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">
                    {loading ? 'Memuat...' : 'Tambah Member Baru'}
                </span>
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 md:px-5 md:py-4 rounded-2xl flex items-start md:items-center gap-3 shadow-sm mb-6">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-sm md:text-base">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && !customers.length ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-sky-100">
                    <RefreshCw className="w-10 h-10 md:w-12 md:h-12 animate-spin text-sky-500 mx-auto mb-4" />
                    <p className="text-sky-600 font-medium text-sm md:text-base">Memuat data member...</p>
                </div>
            ) : (
                <>
                    {/* Customer List */}
                    <div className="space-y-4">
                        {customers.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-md p-6 md:p-12 text-center border border-sky-100">
                                <Users className="w-12 h-12 md:w-20 md:h-20 text-sky-200 mx-auto mb-4" />
                                <h3 className="text-lg md:text-xl font-semibold text-sky-700 mb-2">
                                    {search ? 'Tidak ditemukan customer' : 'Belum ada customer'}
                                </h3>
                                <p className="text-sky-500 text-sm md:text-base mb-5">
                                    {search
                                        ? `Tidak ditemukan customer dengan kata kunci "${search}"`
                                        : 'Mulai dengan menambahkan customer atau member pertama Anda.'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={() => openModal()}
                                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Customer Pertama
                                    </button>
                                )}
                            </div>
                        ) : (
                            customers.map((customer) => (
                                <div
                                    key={customer.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 md:p-5 border-2 border-sky-100 hover:border-sky-300"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                <h3 className="font-bold text-sky-900 text-base md:text-lg">
                                                    {customer.name}
                                                </h3>
                                                {getStatusBadge(customer)}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-sky-700 mb-3">
                                                {customer.phone && (
                                                    <span className="flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                                                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                                                        <span className="font-medium">{customer.phone}</span>
                                                    </span>
                                                )}

                                                {customer.type === 'member' && customer.member_expiry && (
                                                    <span
                                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${
                                                            new Date(customer.member_expiry) < new Date()
                                                                ? 'bg-red-50 text-red-600 border border-red-200'
                                                                : 'bg-sky-50 text-sky-700 border border-sky-100'
                                                        }`}
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Exp: {formatDate(customer.member_expiry)}
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full text-sky-600">
                                                    <User className="w-3.5 h-3.5 text-sky-500" />
                                                    Bergabung: {customer.created_at_formatted}
                                                </span>
                                            </div>

                                            {customer.address && (
                                                <p className="text-xs md:text-sm text-sky-600 flex items-start gap-2 mb-3">
                                                    <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{customer.address}</span>
                                                </p>
                                            )}

                                            {customer.type === 'member' && customer.balance > 0 && (
                                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3.5 py-2 rounded-xl border border-green-200">
                                                    <Wallet className="w-4 h-4 text-green-600" />
                                                    <span className="text-xs text-green-700 font-medium">Saldo:</span>
                                                    <span className="text-sm md:text-base font-bold text-green-700">
                                                        {formatCurrency(customer.balance)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 self-end md:self-start shrink-0">
                                            <button
                                                onClick={() => openModal(true, customer)}
                                                disabled={loading}
                                                className="p-2 md:p-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all duration-200 border-2 border-sky-200 hover:border-sky-300 shadow-sm hover:shadow-md"
                                                title="Edit customer"
                                                aria-label="Edit customer"
                                            >
                                                <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Yakin ingin menghapus customer "${customer.name}"?`)) {
                                                        deleteCustomer(customer.id);
                                                    }
                                                }}
                                                disabled={loading || !customer.can_delete}
                                                className={`p-2 md:p-3 rounded-xl transition-all duration-200 border-2 shadow-sm ${
                                                    !customer.can_delete
                                                        ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                        : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md'
                                                }`}
                                                title={
                                                    !customer.can_delete
                                                        ? 'Tidak bisa dihapus karena sudah ada order'
                                                        : 'Hapus customer'
                                                }
                                                aria-label="Hapus customer"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4 border border-sky-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs md:text-sm text-sky-600 mb-3">
                                <span>
                                    Menampilkan <strong>{pagination.from}</strong> - <strong>{pagination.to}</strong> dari{' '}
                                    <strong>{pagination.total}</strong> customer
                                </span>
                                <span>
                                    Halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.totalPages}</strong>
                                </span>
                            </div>
                            <div className="flex justify-center">
                                <nav className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setPage(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1 || loading}
                                        className="px-3 py-2 border-2 border-sky-200 rounded-xl bg-white text-sky-600 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
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
                                                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
                                                    pagination.currentPage === pageNum
                                                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
                                                        : 'border-2 border-sky-200 bg-white text-sky-700 hover:bg-sky-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPage(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                        className="px-3 py-2 border-2 border-sky-200 rounded-xl bg-white text-sky-600 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Customer Modal */}
            <CustomerModal />
        </div>
    );
};

export default CustomerIndex;