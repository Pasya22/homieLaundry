// src/components/services/ServicesIndex.tsx
import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit, Trash2, AlertCircle, RefreshCw, DollarSign, Clock } from 'lucide-react';
import { serviceService, type Service, type ServiceFormData } from '../../services/serviceService';

const ServicesIndex: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: 0,
        member_price: 0,
        category: '',
        duration: '24 jam',
        is_weight_based: false,
        is_active: true,
        size: '',
    });

    const durations = ['2 jam', '4 jam', '6 jam', '12 jam', '24 jam', '48 jam', '72 jam'];
    const sizes = ['', 'S', 'M', 'L', 'XL'];

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setFilteredServices(services.filter(s => s.category === selectedCategory));
        } else {
            setFilteredServices(services);
        }
    }, [selectedCategory, services]);

    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const grouped = await serviceService.getServices();
            const allServices = Object.values(grouped).flat();
            setServices(allServices);
            setFilteredServices(allServices);
            setCategories(Object.keys(grouped));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat layanan');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            member_price: 0,
            category: '',
            duration: '24 jam',
            is_weight_based: false,
            is_active: true,
            size: '',
        });
        setShowModal(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            member_price: service.member_price || 0,
            category: service.category,
            duration: service.duration,
            is_weight_based: service.is_weight_based,
            is_active: service.is_active,
            size: service.size || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (editingService) {
                await serviceService.updateService(editingService.id, formData);
            } else {
                await serviceService.createService(formData);
            }
            setShowModal(false);
            fetchServices();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan layanan');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Yakin ingin menghapus layanan "${name}"?`)) return;

        setLoading(true);
        try {
            await serviceService.deleteService(id);
            fetchServices();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menghapus layanan');
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                    <Tag className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700">Manajemen Layanan</h1>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                            !selectedCategory
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Semua ({services.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                                selectedCategory === cat
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {cat} ({services.filter(s => s.category === cat).length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={openCreateModal}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md"
            >
                <Plus className="w-5 h-5" />
                Tambah Layanan Baru
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Services List */}
            <div className="space-y-4">
                {loading && !services.length ? (
                    <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-600">Memuat layanan...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center border">
                        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada layanan</h3>
                        <p className="text-gray-500">
                            {selectedCategory
                                ? `Tidak ada layanan di kategori "${selectedCategory}"`
                                : 'Mulai dengan menambahkan layanan pertama'}
                        </p>
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div
                            key={service.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 border border-gray-200"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border">
                                            {service.category}
                                        </span>
                                        {!service.is_active && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>

                                    {service.description && (
                                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {service.duration}
                                        </span>
                                        {service.size && <span className="font-medium">Size: {service.size}</span>}
                                        <span className="font-medium">
                                            {service.is_weight_based ? 'Per Kg' : 'Per Pcs'}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(service.price)}
                                            </span>
                                        </div>
                                        {service.member_price && (
                                            <div className="text-sm text-blue-600">
                                                Member: {formatCurrency(service.member_price)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(service)}
                                        disabled={loading}
                                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-200"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id, service.name)}
                                        disabled={loading}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-blue-700">
                                {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi *</label>
                                <select
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {durations.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Member</label>
                                    <input
                                        type="number"
                                        value={formData.member_price || ''}
                                        onChange={e => setFormData({ ...formData, member_price: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran</label>
                                <select
                                    value={formData.size}
                                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {sizes.map(s => (
                                        <option key={s} value={s}>{s || 'Tidak ada'}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_weight_based}
                                        onChange={e => setFormData({ ...formData, is_weight_based: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Per Kilogram</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Aktif</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan'}
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

export default ServicesIndex;