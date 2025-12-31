import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import {
    User, ShoppingBag, FileText, CreditCard,
    ArrowLeft, ArrowRight, Check, Search,
    X, Plus, Minus, Clock, AlertCircle,
    Filter, Tag,
    Scale,
    Package,
    Trash2,
    CheckCircle
} from 'lucide-react';
import { type Service } from '../../types/order';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '../../types/customer';

const CreateOrder = () => {
    const {
        createOrder,
        customers,
        services,
        loading,
        error,
        fetchCustomers,
        fetchServices,
        selectCustomer,
        setNewCustomer,
        toggleService,
        // updateServiceQuantity,
        updateServiceWeight,
        updateServiceNote,
        addCustomItem,
        removeCustomItem,
        updateCustomItem,
        // setOrderNotes,
        setPaymentMethod,
        setEstimatedCompletion,
        setPaymentProof,
        setPaymentConfirmation,
        proceedToNextStep,
        goToPrevStep,
        createNewOrder,
        // resetCreateOrder,
    } = useOrderStore();

    const [customerSearch, setCustomerSearch] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    // const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);


    const [showPaymentProofForm, setShowPaymentProofForm] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (createOrder.step === 1) {
            fetchCustomers(customerSearch);
        }
        if (createOrder.step === 2) {
            if (!services || Object.keys(services).length === 0) {
                fetchServices();
            }
        }
    }, [createOrder.step, customerSearch]);

    useEffect(() => {
        if (createOrder.payment_method === 'deposit') {
            setPaymentConfirmation('now');
            setShowPaymentProofForm(false);
        } else if (createOrder.payment_method === 'cash' || createOrder.payment_method === 'transfer') {
            // Untuk cash/transfer, default ke 'now' jika belum diset
            if (!createOrder.paymentConfirmation) {
                setPaymentConfirmation('now');
            }
            setShowPaymentProofForm(createOrder.paymentConfirmation === 'now');
        }
    }, [createOrder.payment_method, createOrder.paymentConfirmation]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentProof(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    // Filter services berdasarkan search dan kategori
    // useEffect(() => {
    //     if (createOrder.step === 2 && services) {
    //         const allServices = getAllServices();
    //         let filtered = allServices;

    //         // Filter by search - FIX: reset jika search kosong
    //         if (serviceSearch.trim()) {
    //             const searchLower = serviceSearch.toLowerCase();
    //             filtered = filtered.filter(service =>
    //                 service.name.toLowerCase().includes(searchLower) ||
    //                 service.category.toLowerCase().includes(searchLower) ||
    //                 (service.description && service.description.toLowerCase().includes(searchLower))
    //             );
    //         } else {
    //             // Jika search kosong, tetap tampilkan semua (atau berdasarkan kategori)
    //             // Tidak perlu reset ke array kosong
    //         }

    //         // Filter by category
    //         if (selectedCategory !== 'all') {
    //             filtered = filtered.filter(service =>
    //                 service.category === selectedCategory
    //             );
    //         }

    //         setFilteredServices(filtered);
    //     } else {
    //         // Reset jika bukan step 2 atau services belum load
    //         setFilteredServices([]);
    //     }
    // }, [services, serviceSearch, selectedCategory, createOrder.step]);
    const filteredServices = () => {
        let allServices = getAllServices();
        let filtered = allServices;

        if (serviceSearch.trim()) {
            const searchLower = serviceSearch.toLowerCase();
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(searchLower) ||
                service.category.toLowerCase().includes(searchLower)
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(service => service.category === selectedCategory);
        }

        return filtered;
    };


    useEffect(() => {
        if (customers.length > 0 && customerSearch.trim()) {
            const searchLower = customerSearch.toLowerCase();
            const filtereds = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchLower) ||
                (customer.phone && customer.phone.includes(searchLower))
            );
            setFilteredCustomers(filtereds);
        } else {
            setFilteredCustomers([]);
        }
    }, [customers, customerSearch])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getSelectedCustomerName = () => {
        if (createOrder.selectedCustomer) {
            return createOrder.selectedCustomer.name;
        }
        return createOrder.newCustomer.name || 'Pelanggan Baru';
    };

    const getServiceCount = () => {
        return createOrder.selectedServices.length;
    };

    // Helper function untuk mendapatkan semua services
    const getAllServices = () => {
        if (!services) return [];
        if (Array.isArray(services)) return services;
        if (typeof services === 'object') {
            return Object.values(services).flat();
        }
        return [];
    };

    const getServiceById = (id: number): Service | undefined => {
        return getAllServices().find(s => s.id === id);
    };

    // const getServiceUnit = (service: Service) => {
    //     return service.is_weight_based ? 'kg' : 'pcs';
    // };

    // Get unique categories for filter
    const getCategories = (): string[] => {
        const allServices = getAllServices();
        const categories = Array.from(new Set(allServices.map(s => s.category)));
        return ['all', ...categories];
    };
    const handleCreateOrder = async () => {
        // Validasi upload bukti jika bayar sekarang (untuk cash/transfer)
        if (createOrder.payment_method !== 'deposit' &&
            createOrder.paymentConfirmation === 'now' &&
            !createOrder.payment_proof) {
            alert('Silakan upload bukti pembayaran');
            return;
        }

        try {
            const orderData = {
                customer_id: createOrder.selectedCustomer?.id,
                customer: !createOrder.selectedCustomer ? {
                    name: createOrder.newCustomer.name,
                    phone: createOrder.newCustomer.phone,
                    address: createOrder.newCustomer.address,
                    type: createOrder.newCustomer.type,
                    deposit: createOrder.newCustomer.deposit,
                } : undefined,
                items: createOrder.selectedServices.map(serviceId => {
                    const service = getServiceById(serviceId);
                    return {
                        service_id: serviceId,
                        quantity: createOrder.serviceQuantities[serviceId] || 1,
                        weight: service?.is_weight_based ? createOrder.serviceWeights[serviceId] : undefined,
                        notes: createOrder.serviceNotes[serviceId] || '',
                        custom_items: createOrder.serviceCustomItems[serviceId] || [],
                    };
                }),
                order_notes: createOrder.orderNotes,
                payment_method: createOrder.payment_method,
                payment_confirmation: createOrder.paymentConfirmation,
                payment_proof: createOrder.payment_proof || undefined,
                estimated_completion: createOrder.estimatedCompletion,
            };
            await createNewOrder(orderData);
            alert('Order berhasil dibuat!');
            navigate('/orders');
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    const isDepositPaymentValid = () => {
        if (createOrder.payment_method !== 'deposit') return true;

        const customer = createOrder.selectedCustomer;
        if (!customer) return false;
        if (customer.type !== 'member') return false;

        return customer.balance >= createOrder.total;
    };

    const getDepositWarningMessage = () => {
        if (createOrder.payment_method !== 'deposit') return null;

        const customer = createOrder.selectedCustomer;
        if (!customer) return 'Pelanggan belum dipilih';
        if (customer.type !== 'member') return 'Pembayaran deposit hanya untuk member';
        if (customer.balance < createOrder.total) {
            return `Saldo tidak mencukupi. Saldo tersedia: ${formatCurrency(customer.balance)}`;
        }

        return null;
    };


    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-sky-700 flex items-center gap-2">
                <User className="w-5 h-5" />
                Pilih Pelanggan
            </h2>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Cari pelanggan..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white shadow-sm"
                />
            </div>

            {createOrder.selectedCustomer ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-green-800">{createOrder.selectedCustomer.name}</h3>
                            <p className="text-sm text-green-600">
                                {createOrder.selectedCustomer.phone || 'No telepon tidak tersedia'}
                            </p>
                            {createOrder.selectedCustomer.address && (
                                <p className="text-sm text-green-600">{createOrder.selectedCustomer.address}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${createOrder.selectedCustomer.type === 'member'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                                    }`}>
                                    {createOrder.selectedCustomer.type === 'member' ? 'Member' : 'Regular'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => selectCustomer(null)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : customerSearch && (
                <div className="max-h-60 overflow-y-auto border-2 border-sky-100 rounded-xl shadow-inner">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => selectCustomer(customer)}
                                className="p-3 border-b border-sky-50 hover:bg-sky-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{customer.name}</h4>
                                        <p className="text-sm text-gray-600">{customer.phone || 'No telepon tidak tersedia'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                                                {customer.type === 'member' ? 'Member' : 'Regular'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : customerSearch.trim() ? ( // Tampilkan "not found" hanya jika ada search query
                        <div className="p-6 text-center text-gray-500">
                            <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>Pelanggan "{customerSearch}" tidak ditemukan</p>
                        </div>
                    ) : null}
                </div>
            )}

            {!createOrder.selectedCustomer && (
                <div className="space-y-4 border-2 border-sky-100 rounded-xl p-4 bg-white mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-md font-bold text-gray-800">Pelanggan Baru</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            value={createOrder.newCustomer.name}
                            onChange={(e) => setNewCustomer({ name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="Masukkan nama pelanggan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Customer</label>
                        <select
                            value={createOrder.newCustomer.type}
                            onChange={(e) => setNewCustomer({
                                type: e.target.value as 'regular' | 'member'
                            })}
                            className="w-full px-4 py-3 border-2 border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                        >
                            <option value="regular">Regular</option>
                            <option value="member">Member</option>
                        </select>
                    </div>

                    {createOrder.newCustomer.type === 'member' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Awal</label>
                            <input
                                type="number"
                                value={createOrder.newCustomer.deposit}
                                onChange={(e) => setNewCustomer({ deposit: parseFloat(e.target.value) || 0 })}
                                min="0"
                                className="w-full px-4 py-3 border-2 border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="Masukkan deposit awal"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                        <input
                            type="tel"
                            value={createOrder.newCustomer.phone}
                            onChange={(e) => setNewCustomer({ phone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="Contoh: 08123456789"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                            value={createOrder.newCustomer.address}
                            onChange={(e) => setNewCustomer({ address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 border-2 border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                            placeholder="Masukkan alamat pelanggan"
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Batal
                </button>
                <button
                    onClick={proceedToNextStep}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    Lanjut ke Layanan
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => {
        if (loading) {
            return (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-sky-700">Memuat Layanan...</h2>
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            );
        }

        const categories = getCategories();
        const filtered = filteredServices();

        // FIX: Tambahkan tipe eksplisit untuk grouped
        const grouped = filtered.reduce<Record<string, Service[]>>((acc, service) => {
            if (!acc[service.category]) acc[service.category] = [];
            acc[service.category].push(service);
            return acc;
        }, {});

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-sky-700 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Pilih Layanan
                    </h2>
                    <div className="text-sm text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                        {filtered.length} layanan
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                        <input
                            type="text"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            placeholder="Cari layanan..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <Filter className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <div className="flex gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${selectedCategory === category
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-white border-2 border-sky-100'
                                        }`}
                                >
                                    {category === 'all' ? 'Semua' : category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Services List */}
                <div className="space-y-4">
                    {/* FIX: Tambahkan tipe eksplisit untuk categoryServices */}
                    {Object.entries(grouped).map(([category, categoryServices]: [string, Service[]]) => (
                        <div key={category} className="bg-white rounded-xl border-2 border-sky-100">
                            <div className="bg-sky-50 px-4 py-3 border-b border-sky-100">
                                <h3 className="font-bold text-sky-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {category}
                                </h3>
                            </div>
                            <div className="divide-y divide-sky-50">
                                {categoryServices.map(service => {
                                    const isSelected = createOrder.selectedServices.includes(service.id);
                                    const customItems = createOrder.serviceCustomItems[service.id] || [];

                                    return (
                                        <div key={service.id} className={`p-4 ${isSelected ? 'bg-sky-50' : ''}`}>
                                            {/* Rest of the service card code remains the same */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                    <p className="text-sm text-gray-600">{service.duration}</p>
                                                    <div className="mt-2 text-lg font-bold text-green-600">
                                                        {formatCurrency(service.price)}/{service.is_weight_based ? 'kg' : 'pcs'}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleService(service.id)}
                                                    className={`px-4 py-2 rounded-lg font-medium ${isSelected
                                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                                                        }`}
                                                >
                                                    {isSelected ? 'Hapus' : 'Pilih'}
                                                </button>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-4 pt-4 border-t border-sky-200 space-y-4">
                                                    {/* Input Berat */}
                                                    {service.is_weight_based && (
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <label className="text-sm font-medium flex items-center gap-2">
                                                                <Scale className="w-4 h-4 text-sky-600" />
                                                                Berat:
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateServiceWeight(
                                                                        service.id,
                                                                        Math.max(0.5, (createOrder.serviceWeights[service.id] || 1.0) - 0.5)
                                                                    )}
                                                                    className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    value={createOrder.serviceWeights[service.id] || 1.0}
                                                                    onChange={(e) => updateServiceWeight(service.id, parseFloat(e.target.value))}
                                                                    className="w-20 text-center border-2 border-sky-100 rounded-lg py-2"
                                                                />
                                                                <span className="text-sky-600 font-medium">kg</span>
                                                                <button
                                                                    onClick={() => updateServiceWeight(
                                                                        service.id,
                                                                        (createOrder.serviceWeights[service.id] || 1.0) + 0.5
                                                                    )}
                                                                    className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Custom Items */}
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <label className="text-sm font-medium flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-sky-600" />
                                                                Detail Barang:
                                                            </label>
                                                            <button
                                                                onClick={() => addCustomItem(service.id)}
                                                                className="text-sm bg-sky-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 w-full sm:w-auto justify-center"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Tambah Barang
                                                            </button>
                                                        </div>

                                                        {customItems.length === 0 ? (
                                                            <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-sky-200 rounded-lg">
                                                                Belum ada barang
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {customItems.map((item) => (
                                                                    <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border-2 border-sky-100 rounded-lg p-3">
                                                                        {/* Input Nama Barang */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <input
                                                                                type="text"
                                                                                value={item.name}
                                                                                onChange={(e) => updateCustomItem(service.id, item.id, { name: e.target.value })}
                                                                                placeholder="Nama barang (contoh: Kemeja)"
                                                                                className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                                                                            />
                                                                        </div>

                                                                        {/* Kontrol Kuantitas */}
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex items-center gap-1 bg-sky-50 rounded-lg px-2 py-2">
                                                                                <button
                                                                                    onClick={() => updateCustomItem(service.id, item.id, {
                                                                                        quantity: Math.max(1, (item.quantity || 1) - 1)
                                                                                    })}
                                                                                    className="w-6 h-6 hover:bg-sky-100 rounded flex items-center justify-center"
                                                                                >
                                                                                    <Minus className="w-3 h-3" />
                                                                                </button>

                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={item.quantity || 1}
                                                                                    onChange={(e) => updateCustomItem(service.id, item.id, {
                                                                                        quantity: parseInt(e.target.value) || 1
                                                                                    })}
                                                                                    className="w-12 text-center bg-transparent focus:outline-none"
                                                                                />

                                                                                <button
                                                                                    onClick={() => updateCustomItem(service.id, item.id, {
                                                                                        quantity: (item.quantity || 1) + 1
                                                                                    })}
                                                                                    className="w-6 h-6 hover:bg-sky-100 rounded flex items-center justify-center"
                                                                                >
                                                                                    <Plus className="w-3 h-3" />
                                                                                </button>
                                                                            </div>

                                                                            <span className="text-sm text-gray-600 whitespace-nowrap">pcs</span>

                                                                            <button
                                                                                onClick={() => removeCustomItem(service.id, item.id)}
                                                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg flex-shrink-0"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Catatan */}
                                                    <input
                                                        type="text"
                                                        value={createOrder.serviceNotes[service.id] || ''}
                                                        onChange={(e) => updateServiceNote(service.id, e.target.value)}
                                                        placeholder="Catatan (opsional)..."
                                                        className="w-full px-3 py-2 text-sm border-2 border-sky-100 rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ringkasan */}
                {createOrder.selectedServices.length > 0 && (
                    <div className="bg-sky-50 rounded-xl p-4 border-2 border-sky-100">
                        <h4 className="font-bold text-sky-800 mb-3">Ringkasan Order</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Jumlah Layanan:</span>
                                <span className="font-bold">{createOrder.selectedServices.length}</span>
                            </div>
                            {createOrder.totalWeight > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm">Total Berat:</span>
                                    <span className="font-bold">{createOrder.totalWeight.toFixed(1)} kg</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm">Total Item:</span>
                                <span className="font-bold text-sky-700">{createOrder.totalItems} pcs</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-sky-200">
                                <span className="font-bold">Total:</span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(createOrder.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={goToPrevStep}
                        className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                    <button
                        onClick={proceedToNextStep}
                        disabled={createOrder.selectedServices.length === 0}
                        className="flex-1 bg-sky-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl"
                    >
                        Review Order
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStep3 = () => {
        return (
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-sky-700 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Review Order
                </h2>

                <div>
                    <h3 className="font-bold text-gray-800 mb-3">Detail Layanan</h3>
                    <div className="space-y-3">
                        {createOrder.selectedServices.map(serviceId => {
                            const service = getServiceById(serviceId);
                            if (!service) return null;

                            const weight = createOrder.serviceWeights[serviceId] || 0;
                            const notes = createOrder.serviceNotes[serviceId] || '';
                            const customItems = createOrder.serviceCustomItems[serviceId] || [];
                            const price = service.price;

                            let subtotal = 0;
                            if (service.is_weight_based) {
                                subtotal = price * weight;
                            } else {
                                subtotal = price * (createOrder.serviceQuantities[serviceId] || 1);
                            }

                            const totalCustomItems = customItems.reduce((sum, item) => sum + item.quantity, 0);

                            return (
                                <div key={serviceId} className="bg-white rounded-xl p-4 border-2 border-sky-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                                            <p className="text-sm text-gray-600">{service.category}</p>
                                            {service.is_weight_based && (
                                                <p className="text-sm text-sky-600 mt-1">Berat: {weight} kg</p>
                                            )}
                                        </div>
                                        <div className="text-lg font-bold text-green-600">
                                            {formatCurrency(subtotal)}
                                        </div>
                                    </div>

                                    {/* Detail Custom Items */}
                                    {customItems.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-sky-100">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Detail Barang:</p>
                                            <div className="space-y-1">
                                                {customItems.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm bg-sky-50 px-3 py-2 rounded-lg">
                                                        <span className="text-gray-700">{item.name || 'Barang'}</span>
                                                        <span className="font-medium text-sky-700">{item.quantity} pcs</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-sm font-bold bg-sky-100 px-3 py-2 rounded-lg mt-2">
                                                    <span>Total Item:</span>
                                                    <span className="text-sky-700">{totalCustomItems} pcs</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {notes && (
                                        <p className="text-sm text-blue-600 mt-3 bg-blue-50 px-3 py-2 rounded-lg">
                                            📝 {notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Estimasi Waktu Selesai */}
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Estimasi Waktu Selesai
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Waktu Estimasi Selesai
                        </label>
                        <input
                            type="datetime-local"
                            value={createOrder.estimatedCompletion}
                            onChange={(e) => setEstimatedCompletion(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            Waktu estimasi saat ini: {new Date(createOrder.estimatedCompletion).toLocaleString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <h3 className="font-bold text-green-800 mb-3">Ringkasan Pembayaran</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Total Berat:</span>
                            <span className="font-medium">{createOrder.totalWeight > 0 ? `${createOrder.totalWeight.toFixed(1)} kg` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Item:</span>
                            <span className="font-medium">{createOrder.totalItems} pcs</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-green-200">
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-xl font-bold text-green-600">
                                {formatCurrency(createOrder.total)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={goToPrevStep}
                        className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Kembali
                    </button>
                    <button
                        onClick={proceedToNextStep}
                        className="flex-1 bg-sky-500 text-white font-bold py-3 rounded-xl"
                    >
                        Pembayaran
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                </div>
            </div>
        );
    };
    const renderStep4 = () => {
        const selectedCustomer = createOrder.selectedCustomer;
        const isDepositValid = isDepositPaymentValid();
        const depositWarning = getDepositWarningMessage();

        return (
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-sky-700 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pembayaran
                </h2>

                {/* Ringkasan Order */}
                <div className="bg-gradient-to-r from-sky-50 to-white rounded-xl p-4 border-2 border-sky-100">
                    <h3 className="font-bold text-gray-800 mb-3">Ringkasan Order</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pelanggan:</span>
                            <span className="font-bold text-sky-700">{getSelectedCustomerName()}</span>
                        </div>
                        {selectedCustomer && selectedCustomer.type === 'member' && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Saldo Deposit:</span>
                                <span className="font-bold text-purple-600">
                                    {formatCurrency(selectedCustomer.balance)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Jumlah Layanan:</span>
                            <span>{getServiceCount()} layanan</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Berat:</span>
                            <span>{createOrder.totalWeight > 0 ? `${createOrder.totalWeight.toFixed(1)} kg` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-sky-200">
                            <span className="text-lg font-bold text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(createOrder.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Metode Pembayaran */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Cash */}
                        <label
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${createOrder.payment_method === 'cash'
                                    ? 'border-sky-500 bg-gradient-to-r from-sky-50 to-white shadow-md'
                                    : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                }`}
                            onClick={() => {
                                setPaymentMethod('cash');
                            }}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value="cash"
                                checked={createOrder.payment_method === 'cash'}
                                onChange={() => { }}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${createOrder.payment_method === 'cash'
                                        ? 'border-sky-500 bg-sky-500'
                                        : 'border-sky-300'
                                    }`}>
                                    {createOrder.payment_method === 'cash' && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900 text-sm">Tunai</div>
                                    <div className="text-xs text-gray-500">Bayar cash</div>
                                </div>
                            </div>
                        </label>

                        {/* Transfer */}
                        <label
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${createOrder.payment_method === 'transfer'
                                    ? 'border-sky-500 bg-gradient-to-r from-sky-50 to-white shadow-md'
                                    : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                }`}
                            onClick={() => {
                                setPaymentMethod('transfer');
                            }}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value="transfer"
                                checked={createOrder.payment_method === 'transfer'}
                                onChange={() => { }}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${createOrder.payment_method === 'transfer'
                                        ? 'border-sky-500 bg-sky-500'
                                        : 'border-sky-300'
                                    }`}>
                                    {createOrder.payment_method === 'transfer' && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900 text-sm">Transfer</div>
                                    <div className="text-xs text-gray-500">Bank</div>
                                </div>
                            </div>
                        </label>

                        {/* Deposit */}
                        <label
                            className={`flex items-center p-4 border-2 rounded-xl transition-all duration-300 ${createOrder.payment_method === 'deposit'
                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-white shadow-md'
                                    : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                } ${!selectedCustomer || selectedCustomer.type !== 'member'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                }`}
                            onClick={() => {
                                if (selectedCustomer && selectedCustomer.type === 'member') {
                                    setPaymentMethod('deposit');
                                }
                            }}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value="deposit"
                                checked={createOrder.payment_method === 'deposit'}
                                onChange={() => { }}
                                disabled={!selectedCustomer || selectedCustomer.type !== 'member'}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${createOrder.payment_method === 'deposit'
                                        ? 'border-purple-500 bg-purple-500'
                                        : 'border-sky-300'
                                    }`}>
                                    {createOrder.payment_method === 'deposit' && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900 text-sm">Deposit</div>
                                    <div className="text-xs text-gray-500">Member</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Warning untuk Deposit Payment yang tidak valid */}
                {createOrder.payment_method === 'deposit' && depositWarning && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-red-800 mb-1">Pembayaran Deposit Tidak Valid</p>
                                <p className="text-red-700">{depositWarning}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info untuk Deposit Payment yang valid - Langsung Lunas */}
                {createOrder.payment_method === 'deposit' && isDepositValid && selectedCustomer && (
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-purple-800 mb-1">Pembayaran via Deposit</p>
                                <p className="text-purple-700 mb-2">
                                    ✅ Pembayaran akan otomatis dipotong dari saldo deposit member. Status pembayaran: <span className="font-bold text-green-600">LUNAS</span>
                                </p>
                                <div className="bg-white rounded-lg p-3 mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-600">Saldo Saat Ini:</span>
                                        <span className="text-sm font-bold text-purple-700">
                                            {formatCurrency(selectedCustomer.balance)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-600">Total Order:</span>
                                        <span className="text-sm font-bold text-red-600">
                                            - {formatCurrency(createOrder.total)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                                        <span className="text-xs font-bold text-gray-800">Sisa Saldo:</span>
                                        <span className="text-base font-bold text-green-600">
                                            {formatCurrency(selectedCustomer.balance - createOrder.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Konfirmasi Pembayaran - Tampilkan HANYA untuk Cash & Transfer */}
                {(createOrder.payment_method === 'cash' || createOrder.payment_method === 'transfer') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Konfirmasi Pembayaran</label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Bayar Sekarang */}
                            <label
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${createOrder.paymentConfirmation === 'now'
                                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-white shadow-md'
                                        : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                    }`}
                                onClick={() => {
                                    setPaymentConfirmation('now');
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment_confirmation"
                                    value="now"
                                    checked={createOrder.paymentConfirmation === 'now'}
                                    onChange={() => { }}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${createOrder.paymentConfirmation === 'now'
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-sky-300'
                                        }`}>
                                        {createOrder.paymentConfirmation === 'now' && (
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Bayar Sekarang</div>
                                        <div className="text-xs text-gray-500">Upload bukti</div>
                                    </div>
                                </div>
                            </label>

                            {/* Bayar Nanti */}
                            <label
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${createOrder.paymentConfirmation === 'later'
                                        ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-white shadow-md'
                                        : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                    }`}
                                onClick={() => {
                                    setPaymentConfirmation('later');
                                    setPaymentProof(null);
                                    setPreviewUrl(null);
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment_confirmation"
                                    value="later"
                                    checked={createOrder.paymentConfirmation === 'later'}
                                    onChange={() => { }}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${createOrder.paymentConfirmation === 'later'
                                            ? 'border-yellow-500 bg-yellow-500'
                                            : 'border-sky-300'
                                        }`}>
                                        {createOrder.paymentConfirmation === 'later' && (
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Bayar Nanti</div>
                                        <div className="text-xs text-gray-500">Pending</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Form Upload Bukti Transfer - Hanya untuk Cash & Transfer dengan Bayar Sekarang */}
                {(createOrder.payment_method === 'cash' || createOrder.payment_method === 'transfer') &&
                    createOrder.paymentConfirmation === 'now' && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Upload Bukti Pembayaran
                            </h4>

                            {/* Informasi Read-Only */}
                            <div className="space-y-3 mb-4">
                                <div className="bg-white rounded-lg p-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Customer</label>
                                    <input
                                        type="text"
                                        value={getSelectedCustomerName()}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                                    />
                                </div>

                                <div className="bg-white rounded-lg p-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Layanan</label>
                                    <div className="space-y-1">
                                        {createOrder.selectedServices.map(serviceId => {
                                            const service = getServiceById(serviceId);
                                            return service ? (
                                                <div key={serviceId} className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded">
                                                    {service.name}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Pembayaran</label>
                                    <input
                                        type="text"
                                        value={formatCurrency(createOrder.total)}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-bold text-green-600"
                                    />
                                </div>
                            </div>

                            {/* Upload File */}
                            <div>
                                <label className="block text-sm font-medium text-green-800 mb-2">
                                    Bukti {createOrder.payment_method === 'cash' ? 'Pembayaran' : 'Transfer'} *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Format: JPG, PNG, PDF (Max 5MB)
                                </p>

                                {/* Preview */}
                                {previewUrl && (
                                    <div className="mt-3">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full h-48 object-contain rounded-lg border-2 border-green-200"
                                        />
                                    </div>
                                )}

                                {createOrder.payment_proof && !previewUrl && (
                                    <div className="mt-3 bg-white rounded-lg p-3 border border-green-200">
                                        <p className="text-sm text-gray-700">
                                            📄 {createOrder.payment_proof.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Alert untuk payment later - Hanya untuk Cash & Transfer */}
                {(createOrder.payment_method === 'cash' || createOrder.payment_method === 'transfer') &&
                    createOrder.paymentConfirmation === 'later' && (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-800 mb-1">Pembayaran Belum Dikonfirmasi</p>
                                    <p className="text-yellow-700">
                                        Order akan diproses setelah customer melakukan pembayaran dan mengupload bukti transfer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Tombol Navigasi */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={goToPrevStep}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                    <button
                        onClick={handleCreateOrder}
                        disabled={
                            loading ||
                            (createOrder.payment_method === 'deposit' && !isDepositValid) ||
                            ((createOrder.payment_method === 'cash' || createOrder.payment_method === 'transfer') &&
                                createOrder.paymentConfirmation === 'now' &&
                                !createOrder.payment_proof)
                        }
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Membuat...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Buat Order
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const steps = ['Pelanggan', 'Layanan', 'Review', 'Bayar'];

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-3 sm:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                            Transaksi Baru
                        </h1>
                        <p className="text-sm text-sky-600 font-medium">Langkah {createOrder.step} dari {steps.length}</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-sky-100">
                    <div className="flex justify-between items-center">
                        {steps.map((stepName, index) => {
                            const stepNumber = index + 1;
                            const isCompleted = createOrder.step > stepNumber;
                            const isCurrent = createOrder.step === stepNumber;

                            return (
                                <React.Fragment key={index}>
                                    <div className="flex flex-col items-center flex-1">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${isCompleted
                                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
                                            : isCurrent
                                                ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg scale-110'
                                                : 'bg-sky-100 text-sky-600 border-2 border-sky-200'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-3 h-3 sm:w-5 sm:h-5" />
                                            ) : (
                                                stepNumber
                                            )}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium transition-colors ${isCurrent ? 'text-sky-700 font-bold' : 'text-gray-500'
                                            }`}>
                                            {stepName}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-1 sm:mx-2 transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-sky-200'
                                            }`}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 shadow-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-sky-100">
                    {createOrder.step === 1 && renderStep1()}
                    {createOrder.step === 2 && renderStep2()}
                    {createOrder.step === 3 && renderStep3()}
                    {createOrder.step === 4 && renderStep4()}
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;