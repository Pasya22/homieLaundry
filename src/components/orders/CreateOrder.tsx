import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import {
    User, ShoppingBag, FileText, CreditCard,
    ArrowLeft, ArrowRight, Check, Search,
    X, Plus, Minus, Clock, AlertCircle
} from 'lucide-react';
import { type Service } from '../../types/order';

const CreateOrder: React.FC = () => {
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
        updateServiceQuantity,
        updateServiceWeight,
        updateServiceNote,
        setOrderNotes,
        setPaymentMethod,
        setEstimatedCompletion,
        proceedToNextStep,
        goToPrevStep,
        createNewOrder,
        resetCreateOrder,
    } = useOrderStore();

    const [customerSearch, setCustomerSearch] = useState('');

    useEffect(() => {
        if (createOrder.step === 1) {
            fetchCustomers(customerSearch);
        }
        if (createOrder.step === 2) {
            // Cek apakah services sudah di-load
            if (!services || Object.keys(services).length === 0) {
                fetchServices();
            }
        }
    }, [createOrder.step, customerSearch]);

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

    // Helper function untuk mendapatkan semua services dari object yang dikelompokkan
    const getAllServices = (): Service[] => {
        if (!services) return [];
        
        // Jika services adalah object yang sudah dikelompokkan
        if (typeof services === 'object' && !Array.isArray(services)) {
            // Flatten object menjadi array
            return Object.values(services).flat() as Service[];
        }
        
        // Jika services adalah array
        if (Array.isArray(services)) {
            return services;
        }
        
        return [];
    };

    const getServiceById = (id: number): Service | undefined => {
        return getAllServices().find(s => s.id === id);
    };

    const getServiceUnit = (service: Service) => {
        return service.is_weight_based ? 'kg' : 'pcs';
    };

    const handleCreateOrder = async () => {
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
                    };
                }),
                order_notes: createOrder.orderNotes,
                payment_method: createOrder.paymentMethod,
                estimated_completion: createOrder.estimatedCompletion,
            };

            await createNewOrder(orderData);
            resetCreateOrder();
            alert('Order berhasil dibuat!');
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <User className="w-5 h-5" />
                Pilih Pelanggan
            </h2>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Cari pelanggan..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {createOrder.selectedCustomer ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-green-800">{createOrder.selectedCustomer.name}</h3>
                            <p className="text-sm text-green-600">
                                {createOrder.selectedCustomer.phone || 'No telepon tidak tersedia'}
                            </p>
                            {createOrder.selectedCustomer.address && (
                                <p className="text-sm text-green-600">{createOrder.selectedCustomer.address}</p>
                            )}
                            <p className="text-xs text-green-700 mt-1">
                                {createOrder.selectedCustomer.type === 'member' ? 'Member' : 'Regular'}
                            </p>
                        </div>
                        <button
                            onClick={() => selectCustomer(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : customerSearch && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {customers.length > 0 ? (
                        customers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => selectCustomer(customer)}
                                className="p-3 border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            >
                                <h4 className="font-medium text-gray-900">{customer.name}</h4>
                                <p className="text-sm text-gray-600">{customer.phone || 'No telepon tidak tersedia'}</p>
                                <p className="text-xs text-gray-500">{customer.type === 'member' ? 'Member' : 'Regular'}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            <p>Pelanggan tidak ditemukan</p>
                        </div>
                    )}
                </div>
            )}

            {!createOrder.selectedCustomer && (
                <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-700">Pelanggan Baru</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            value={createOrder.newCustomer.name}
                            onChange={(e) => setNewCustomer({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Contoh: 08123456789"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                            value={createOrder.newCustomer.address}
                            onChange={(e) => setNewCustomer({ address: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan alamat pelanggan"
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                    Batal
                </button>
                <button
                    onClick={proceedToNextStep}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                >
                    Lanjut ke Layanan
                    <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => {
        console.log('=== DEBUG renderStep2 ===');
        console.log('services:', services);
        console.log('typeof services:', typeof services);
        console.log('Array.isArray(services):', Array.isArray(services));

        if (loading) {
            return (
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Pilih Layanan
                    </h2>
                    <div className="text-center py-8">
                        <p className="text-gray-500">Memuat layanan...</p>
                    </div>
                </div>
            );
        }

        if (!services) {
            return (
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Pilih Layanan
                    </h2>
                    <div className="text-center py-8">
                        <p className="text-gray-500">Menunggu data layanan...</p>
                        <button 
                            onClick={() => fetchServices()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Muat Ulang
                        </button>
                    </div>
                </div>
            );
        }

        // Fungsi untuk mendapatkan grouped services
        const getGroupedServices = () => {
            // Jika services sudah dikelompokkan (object)
            if (typeof services === 'object' && !Array.isArray(services)) {
                return services;
            }
            // Jika services masih array, group dulu
            if (Array.isArray(services)) {
                return services.reduce((acc: Record<string, Service[]>, service) => {
                    if (!acc[service.category]) {
                        acc[service.category] = [];
                    }
                    acc[service.category].push(service);
                    return acc;
                }, {});
            }
            // Default empty object
            return {};
        };

        const groupedServices = getGroupedServices();
        const totalServices = getAllServices().length;

        return (
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Pilih Layanan
                </h2>

                <p className="text-gray-600">
                    Pelanggan: <span className="font-semibold">{getSelectedCustomerName()}</span>
                </p>

                {createOrder.selectedCustomer?.type === 'member' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 font-medium">Member Benefit Active!</p>
                        <p className="text-sm text-green-700">Customer mendapatkan harga khusus member</p>
                    </div>
                )}

                {totalServices === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Tidak ada layanan tersedia</p>
                        <button 
                            onClick={() => fetchServices()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Muat Ulang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedServices).map(([category, categoryServices]) => (
                            <div key={category}>
                                <h3 className="text-md font-semibold text-gray-700 mb-3">{category}</h3>
                                <div className="space-y-3">
                                    {(categoryServices as Service[]).map(service => (
                                        <div
                                            key={service.id}
                                            className={`border rounded-lg p-4 transition duration-150 ${createOrder.selectedServices.includes(service.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                                                    <p className="text-sm text-gray-600">{service.duration}</p>
                                                    <p className="text-xs text-gray-500">{service.description}</p>

                                                    <div className="mt-2">
                                                        {createOrder.selectedCustomer?.type === 'member' && service.member_price ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-bold text-green-600">
                                                                    {formatCurrency(service.member_price)}/{getServiceUnit(service)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    {formatCurrency(service.price)}
                                                                </span>
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                    Member
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-lg font-bold text-green-600">
                                                                {formatCurrency(service.price)}/{getServiceUnit(service)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleService(service.id)}
                                                    disabled={loading}
                                                    className={`px-4 py-2 text-sm rounded transition duration-200 ${createOrder.selectedServices.includes(service.id)
                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        }`}
                                                >
                                                    {createOrder.selectedServices.includes(service.id) ? 'Hapus' : 'Pilih'}
                                                </button>
                                            </div>

                                            {createOrder.selectedServices.includes(service.id) && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    {service.is_weight_based ? (
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm font-medium text-gray-700">Berat Pakaian:</label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateServiceWeight(
                                                                        service.id,
                                                                        (createOrder.serviceWeights[service.id] || 1.0) - 0.5
                                                                    )}
                                                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                                </button>

                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={createOrder.serviceWeights[service.id] || 1.0}
                                                                        onChange={(e) => updateServiceWeight(service.id, parseFloat(e.target.value))}
                                                                        step="0.1"
                                                                        min="0.1"
                                                                        max="50"
                                                                        className="w-20 text-center border border-gray-300 rounded-lg py-2 px-3"
                                                                    />
                                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
                                                                </div>

                                                                <button
                                                                    onClick={() => updateServiceWeight(
                                                                        service.id,
                                                                        (createOrder.serviceWeights[service.id] || 1.0) + 0.5
                                                                    )}
                                                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Plus className="w-3 h-3 text-gray-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm font-medium text-gray-700">Jumlah Baju:</label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateServiceQuantity(
                                                                        service.id,
                                                                        (createOrder.serviceQuantities[service.id] || 1) - 1
                                                                    )}
                                                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                                </button>

                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={createOrder.serviceQuantities[service.id] || 1}
                                                                        onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value))}
                                                                        min="1"
                                                                        max="100"
                                                                        className="w-20 text-center border border-gray-300 rounded-lg py-2 px-3"
                                                                    />
                                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">pcs</span>
                                                                </div>

                                                                <button
                                                                    onClick={() => updateServiceQuantity(
                                                                        service.id,
                                                                        (createOrder.serviceQuantities[service.id] || 1) + 1
                                                                    )}
                                                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                                                                >
                                                                    <Plus className="w-3 h-3 text-gray-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-3">
                                                        <input
                                                            type="text"
                                                            value={createOrder.serviceNotes[service.id] || ''}
                                                            onChange={(e) => updateServiceNote(service.id, e.target.value)}
                                                            placeholder="Catatan untuk layanan ini..."
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {createOrder.selectedServices.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Ringkasan Order</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Jumlah Layanan:</span>
                                <span className="font-medium">{getServiceCount()} layanan</span>
                            </div>
                            {createOrder.totalWeight > 0 && (
                                <div className="flex justify-between">
                                    <span>Total Berat:</span>
                                    <span className="font-medium">{createOrder.totalWeight.toFixed(1)} kg</span>
                                </div>
                            )}
                            {createOrder.totalItems > 0 && (
                                <div className="flex justify-between">
                                    <span>Total Item:</span>
                                    <span className="font-medium">{createOrder.totalItems} pcs</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
                                <span>Total:</span>
                                <span className="text-green-600">{formatCurrency(createOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={goToPrevStep}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Kembali
                    </button>
                    <button
                        onClick={proceedToNextStep}
                        disabled={createOrder.selectedServices.length === 0}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        Review Order
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStep3 = () => {
        // Pastikan services ada
        if (!services) {
            return (
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Review Order
                    </h2>
                    <div className="text-center py-8">
                        <p className="text-gray-500">Memuat data layanan...</p>
                        <button 
                            onClick={() => fetchServices()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Muat Ulang Data
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Review Order
                </h2>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Informasi Pelanggan</h3>
                    <p className="text-gray-900">{getSelectedCustomerName()}</p>
                    {createOrder.selectedCustomer && (
                        <p className="text-sm text-gray-600">{createOrder.selectedCustomer.phone || 'No telepon tidak tersedia'}</p>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Detail Layanan</h3>
                    <div className="space-y-3">
                        {createOrder.selectedServices.map(serviceId => {
                            const service = getServiceById(serviceId);
                            if (!service) return null;

                            const quantity = createOrder.serviceQuantities[serviceId] || 1;
                            const notes = createOrder.serviceNotes[serviceId] || '';
                            const price = createOrder.selectedCustomer?.type === 'member' && service.member_price
                                ? service.member_price
                                : service.price;

                            return (
                                <div key={serviceId} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{service.name} - {service.duration}</h4>
                                            <p className="text-sm text-gray-600">{service.category}</p>
                                            {notes && (
                                                <p className="text-xs text-blue-600 mt-1">Catatan: {notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">
                                                {quantity} x {formatCurrency(price)}
                                            </div>
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(price * quantity)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Order</label>
                    <textarea
                        value={createOrder.orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Tambahkan catatan untuk order ini (opsional)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Perkiraan Selesai
                    </label>
                    <input
                        type="datetime-local"
                        value={createOrder.estimatedCompletion}
                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">Ringkasan Pembayaran</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(createOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t border-blue-200 pt-2">
                            <span>Total:</span>
                            <span className="text-green-600">{formatCurrency(createOrder.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={goToPrevStep}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Kembali
                    </button>
                    <button
                        onClick={proceedToNextStep}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        Pembayaran
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pembayaran
            </h2>

            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Ringkasan Order</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Pelanggan:</span>
                        <span className="font-medium">{getSelectedCustomerName()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Jumlah Layanan:</span>
                        <span>{getServiceCount()} layanan</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(createOrder.total)}</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition duration-150 ${createOrder.paymentMethod === 'cash'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={createOrder.paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer')}
                            className="hidden"
                        />
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${createOrder.paymentMethod === 'cash'
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                {createOrder.paymentMethod === 'cash' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">Tunai</div>
                                <div className="text-xs text-gray-500">Bayar sekarang</div>
                            </div>
                        </div>
                    </label>
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition duration-150 ${createOrder.paymentMethod === 'transfer'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="transfer"
                            checked={createOrder.paymentMethod === 'transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer')}
                            className="hidden"
                        />
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${createOrder.paymentMethod === 'transfer'
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                {createOrder.paymentMethod === 'transfer' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">Transfer</div>
                                <div className="text-xs text-gray-500">Bayar nanti</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {createOrder.paymentMethod === 'transfer' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                            <strong>Pembayaran Transfer:</strong> Order akan diproses setelah pembayaran dikonfirmasi.
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={goToPrevStep}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Kembali
                </button>
                <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                    <Check className="w-4 h-4 inline mr-2" />
                    {loading ? 'Membuat Order...' : 'Buat Order'}
                </button>
            </div>
        </div>
    );

    const steps = ['Pelanggan', 'Layanan', 'Review', 'Bayar'];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700">Transaksi Baru</h1>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center">
                    {steps.map((stepName, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${createOrder.step > index + 1
                                        ? 'bg-green-500 text-white'
                                        : createOrder.step === index + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {createOrder.step > index + 1 ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className={`text-xs mt-1 ${createOrder.step === index + 1 ? 'text-blue-600 font-medium' : 'text-gray-500'
                                    }`}>
                                    {stepName}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${createOrder.step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </React.Fragment>
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

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {createOrder.step === 1 && renderStep1()}
                {createOrder.step === 2 && renderStep2()}
                {createOrder.step === 3 && renderStep3()}
                {createOrder.step === 4 && renderStep4()}
            </div>
        </div>
    );
};

export default CreateOrder;