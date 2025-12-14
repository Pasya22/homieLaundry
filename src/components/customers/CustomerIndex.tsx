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
    ChevronRight
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
            year: 'numeric'
        });
    };

    const getStatusBadge = (customer: any) => {
        if (customer.type === 'member') {
            if (customer.member_status === 'active') {
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1 border border-green-200">
                        <Crown className="w-3 h-3" />
                        Member Aktif
                    </span>
                );
            }
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Member Expired
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                Regular
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Manajemen Member
                </h1>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={debouncedSearch}
                        onChange={(e) => setDebouncedSearch(e.target.value)}
                        placeholder="Cari member..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={() => openModal()}
                disabled={loading}
                className="w-full bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
                <Plus className="w-5 h-5" />
                {loading ? 'Loading...' : 'Tambah Member Baru'}
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 bg-linear-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Loading Skeleton */}
            {loading && !customers.length ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse border">
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
            ) : (
                <>
                    {/* Customer List */}
                    <div className="space-y-4">
                        {customers.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {search ? 'Tidak ditemukan customer' : 'Tidak ada customer'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {search 
                                        ? `Tidak ditemukan customer dengan kata kunci "${search}"`
                                        : 'Mulai dengan menambahkan customer pertama Anda.'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={() => openModal()}
                                        className="bg-blue-500 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
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
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-gray-200 hover:border-blue-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {customer.name}
                                                </h3>
                                                {getStatusBadge(customer)}
                                            </div>

                                            {customer.phone && (
                                                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                                    <Phone className="w-4 h-4" />
                                                    {customer.phone}
                                                </p>
                                            )}

                                            {customer.address && (
                                                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{customer.address}</span>
                                                </p>
                                            )}

                                            {customer.type === 'member' && customer.balance > 0 && (
                                                <p className="text-sm text-green-600 flex items-center gap-2 mb-1">
                                                    <Wallet className="w-4 h-4" />
                                                    Saldo: {formatCurrency(customer.balance)}
                                                </p>
                                            )}

                                            {customer.type === 'member' && customer.member_expiry && (
                                                <p className={`text-xs flex items-center gap-2 ${new Date(customer.member_expiry) < new Date() ? 'text-red-600' : 'text-blue-600'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    Exp: {formatDate(customer.member_expiry)}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Bergabung: {customer.created_at_formatted}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => openModal(true, customer)}
                                                disabled={loading}
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-200 border border-transparent hover:border-blue-200"
                                                title="Edit customer"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Yakin ingin menghapus customer "${customer.name}"?`)) {
                                                        deleteCustomer(customer.id);
                                                    }
                                                }}
                                                disabled={loading || !customer.can_delete}
                                                className={`p-2 rounded-lg transition duration-200 border ${
                                                    !customer.can_delete 
                                                        ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                                                        : 'text-red-500 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200'
                                                }`}
                                                title={!customer.can_delete ? 'Tidak bisa dihapus karena sudah ada order' : 'Hapus customer'}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                <span>Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} customer</span>
                                <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                            </div>
                            <div className="flex justify-center">
                                <nav className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1 || loading}
                                        className="px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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