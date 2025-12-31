import React, { useState, useEffect } from 'react';
import { 
    History, Search, Filter, Download, 
    ArrowUpCircle, ArrowDownCircle, Wallet,
    User, Calendar, DollarSign, FileText,
    TrendingUp, TrendingDown
} from 'lucide-react';

interface Transaction {
    id: number;
    customer_id: number;
    customer_name: string;
    type: 'deposit' | 'deduction' | 'refund';
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_type: 'order' | 'top_up' | 'adjustment';
    reference_id: number | null;
    order_number: string | null;
    description: string;
    created_by: string;
    created_at: string;
}

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        fetchTransactions();
    }, [search, filterType, dateFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`/api/transactions?search=${search}&type=${filterType}&date=${dateFilter}`);
            const data = await response.json();
            setTransactions(data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
            case 'deduction':
                return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
            case 'refund':
                return <TrendingUp className="w-5 h-5 text-blue-600" />;
            default:
                return <Wallet className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const styles = {
            deposit: 'bg-green-100 text-green-800 border-green-200',
            deduction: 'bg-red-100 text-red-800 border-red-200',
            refund: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        const labels = {
            deposit: 'Top Up',
            deduction: 'Penggunaan',
            refund: 'Refund'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[type as keyof typeof styles]}`}>
                {labels[type as keyof typeof labels]}
            </span>
        );
    };

    const calculateStats = () => {
        const totalDeposit = transactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalDeduction = transactions
            .filter(t => t.type === 'deduction')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalRefund = transactions
            .filter(t => t.type === 'refund')
            .reduce((sum, t) => sum + t.amount, 0);

        return { totalDeposit, totalDeduction, totalRefund };
    };

    const stats = calculateStats();

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Riwayat Transaksi
                        </h1>
                        <p className="text-sm text-purple-600 font-medium">
                            Log transaksi deposit member
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border-2 border-green-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total Top Up</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats.totalDeposit)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border-2 border-red-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total Penggunaan</span>
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(stats.totalDeduction)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total Refund</span>
                            <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(stats.totalRefund)}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-purple-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari customer..."
                                className="w-full pl-10 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="deposit">Top Up</option>
                                <option value="deduction">Penggunaan</option>
                                <option value="refund">Refund</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                            >
                                <option value="today">Hari Ini</option>
                                <option value="yesterday">Kemarin</option>
                                <option value="week">Minggu Ini</option>
                                <option value="month">Bulan Ini</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button className="mt-4 w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-gray-600">Memuat transaksi...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Belum ada transaksi</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-purple-50 border-b-2 border-purple-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                                            Tipe
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                                            Keterangan
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-purple-700 uppercase">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-purple-700 uppercase">
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {transaction.customer_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(transaction.type)}
                                                    {getTypeBadge(transaction.type)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">{transaction.description}</p>
                                                    {transaction.order_number && (
                                                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                                                            <FileText className="w-3 h-3" />
                                                            {transaction.order_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`font-bold text-lg ${
                                                    transaction.type === 'deposit' || transaction.type === 'refund'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="text-sm">
                                                    <p className="text-gray-500">
                                                        {formatCurrency(transaction.balance_before)}
                                                    </p>
                                                    <p className="font-bold text-purple-600">
                                                        {formatCurrency(transaction.balance_after)}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;