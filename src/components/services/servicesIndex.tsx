import React, { useEffect, useState, useRef } from 'react';
import { Tag, Plus, Edit, Trash2, AlertCircle, RefreshCw, Clock, Filter, X, Search } from 'lucide-react';
import { serviceService, type Service, type ServiceFormData } from '../../services/serviceService';

const ServicesIndex: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: 0,
        member_price: 0,
        category: 'Reguler',
        duration: '',
        is_weight_based: false,
        is_active: true,
        size: '',
    });

    const modalRef = useRef<HTMLDivElement>(null);
    const filterDrawerRef = useRef<HTMLDivElement>(null);

    // Updated categories from the paper
    const categoriesList = [
        'Reguler',
        'Express',
        'Bedcover',
        'Selimut',
        'Khusus',
        'Proses',
        'Treatment',
        'Satuan'
    ];

    const getSizesForCategory = (category: string) => {
        switch (category) {
            case 'Express':
            case 'Reguler':
                return ['', 'S', 'M', 'L', 'XL', 'XXL'];
            case 'Bedcover':
            case 'Selimut':
                return ['', 'Single', 'Double', 'Queen', 'King'];
            case 'Khusus':
            case 'Treatment':
                return ['', 'Small', 'Medium', 'Large'];
            case 'Satuan':
                return ['', '1 pcs', '2 pcs', '3 pcs', '4 pcs', '5 pcs'];
            default:
                return ['', 'S', 'M', 'L', 'XL'];
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        let filtered = services;
        
        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(s => s.category === selectedCategory);
        }
        
        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term) ||
                s.category.toLowerCase().includes(term)
            );
        }
        
        setFilteredServices(filtered);
    }, [services, selectedCategory, searchTerm]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false);
            }
            if (filterDrawerRef.current && !filterDrawerRef.current.contains(event.target as Node)) {
                setShowFilterDrawer(false);
            }
        };

        if (showModal || showFilterDrawer) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal, showFilterDrawer]);

    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const grouped = await serviceService.getServices();
            const allServices = Object.values(grouped).flat();
            setServices(allServices);
            setFilteredServices(allServices);
            const uniqueCategories = Array.from(new Set(allServices.map(s => s.category)));
            setCategories(uniqueCategories);
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
            category: 'Reguler',
            duration: '',
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-3 md:p-4 lg:p-6">
            {/* Header - Blue Sky Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl shadow-lg">
                        <Tag className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                            Manajemen Layanan
                        </h1>
                        <p className="text-xs md:text-sm text-sky-500">
                            Total {services.length} layanan
                        </p>
                    </div>
                </div>

                {/* Desktop Filter Buttons */}
                <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 filter-button ${!selectedCategory
                                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                            }`}
                    >
                        Semua
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 filter-button ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="md:hidden flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md filter-button"
                >
                    <Filter className="w-4 h-4" />
                    Filter ({selectedCategory || 'Semua'})
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari layanan..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white shadow-sm"
                />
            </div>

            {/* Mobile Filter Drawer */}
            {showFilterDrawer && (
                <div className="md:hidden fixed inset-0 z-40">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowFilterDrawer(false)}
                    />
                    <div ref={filterDrawerRef} className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl animate-slideInRight">
                        <div className="p-4 border-b border-sky-100">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sky-700">Filter Kategori</h3>
                                <button
                                    onClick={() => setShowFilterDrawer(false)}
                                    className="p-2 hover:bg-sky-50 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-sky-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setShowFilterDrawer(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${!selectedCategory
                                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                                        : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                    }`}
                            >
                                Semua ({services.length})
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setShowFilterDrawer(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === cat
                                            ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                        }`}
                                >
                                    {cat} ({services.filter(s => s.category === cat).length})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Category Filter */}
            <div className="hidden md:block bg-white rounded-2xl shadow-md p-4 mb-6 border border-sky-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 filter-button ${!selectedCategory
                                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg transform scale-105'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                            }`}
                    >
                        Semua ({services.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 filter-button ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg transform scale-105'
                                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
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
                className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl mb-6"
            >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Tambah Layanan Baru</span>
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 md:px-5 md:py-4 rounded-2xl flex items-start md:items-center gap-3 shadow-sm mb-6">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-sm md:text-base">{error}</p>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-4">
                {loading && !services.length ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                        <RefreshCw className="w-10 h-10 md:w-12 md:h-12 animate-spin text-sky-500 mx-auto mb-4" />
                        <p className="text-sky-600 font-medium text-sm md:text-base">Memuat layanan...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-6 md:p-12 text-center border border-sky-100">
                        <Tag className="w-12 h-12 md:w-20 md:h-20 text-sky-200 mx-auto mb-4" />
                        <h3 className="text-lg md:text-xl font-semibold text-sky-700 mb-2">Tidak ada layanan</h3>
                        <p className="text-sky-500 text-sm md:text-base">
                            {selectedCategory
                                ? `Tidak ada layanan di kategori "${selectedCategory}"`
                                : 'Mulai dengan menambahkan layanan pertama'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg text-sm"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div
                            key={service.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 md:p-5 border-2 border-sky-100 hover:border-sky-300"
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-3">
                                        <h3 className="font-bold text-sky-900 text-base md:text-lg flex-1">
                                            {service.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 md:px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-sm">
                                                {service.category}
                                            </span>
                                            {!service.is_active && (
                                                <span className="px-2 md:px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border-2 border-red-200">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {service.description && (
                                        <p className="text-xs md:text-sm text-sky-600 mb-3">{service.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-sky-600 mb-3">
                                        <span className="flex items-center gap-1 md:gap-2 bg-sky-50 px-2 md:px-3 py-1 rounded-full">
                                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                            <span className="font-medium">{service.duration}</span>
                                        </span>
                                        {service.size && (
                                            <span className="font-semibold bg-sky-50 px-2 md:px-3 py-1 rounded-full">
                                                Size: {service.size}
                                            </span>
                                        )}
                                        <span className="font-semibold bg-sky-50 px-2 md:px-3 py-1 rounded-full">
                                            {service.is_weight_based ? '📦 Per Kg' : '👕 Per Pcs'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 md:px-4 py-2 rounded-xl border border-green-200">
                                            <span className="text-sm md:text-base font-bold text-green-700">
                                                {formatCurrency(service.price)}
                                            </span>
                                        </div>
                                        {service.member_price && service.member_price > 0 && (
                                            <div className="text-xs bg-sky-50 px-3 py-2 rounded-xl border border-sky-200">
                                                <span className="text-sky-600 font-medium">Member: </span>
                                                <span className="font-bold text-sky-700">
                                                    {formatCurrency(service.member_price)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 self-end md:self-start">
                                    <button
                                        onClick={() => openEditModal(service)}
                                        disabled={loading}
                                        className="p-2 md:p-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all duration-200 border-2 border-sky-200 hover:border-sky-300 shadow-sm hover:shadow-md"
                                        aria-label="Edit"
                                    >
                                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id, service.name)}
                                        disabled={loading}
                                        className="p-2 md:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                                        aria-label="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-sky-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
                    <div ref={modalRef} className="bg-white rounded-2xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-sky-200 m-2 md:m-0 animate-modalIn">
                        <div className="p-4 md:p-6 border-b-2 border-sky-100 sticky top-0 bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-2xl md:rounded-t-3xl">
                            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                                <Tag className="w-5 h-5 md:w-6 md:h-6" />
                                {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">Nama Layanan *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                    placeholder="Contoh: CKG Express 4 Jam"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">Kategori *</label>
                                <select
                                    value={formData.category}
                                    onChange={e => {
                                        setFormData({ 
                                            ...formData, 
                                            category: e.target.value,
                                            size: '' // Reset size when category changes
                                        });
                                    }}
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                >
                                    {categoriesList.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-sky-700 mb-2">Durasi *</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                        placeholder="Contoh: 24 jam, 72 jam, 4 jam"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-sky-700 mb-2">Ukuran (opsional)</label>
                                    <select
                                        value={formData.size}
                                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                    >
                                        {getSizesForCategory(formData.category).map(s => (
                                            <option key={s} value={s}>{s || 'Tidak ada'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-sky-700 mb-2">Harga Regular *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        required
                                        min="0"
                                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                        placeholder="10000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-sky-700 mb-2">Harga Member</label>
                                    <input
                                        type="number"
                                        value={formData.member_price || ''}
                                        onChange={e => setFormData({ ...formData, member_price: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                        placeholder="9000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-sky-700 mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                    placeholder="Deskripsi layanan..."
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-sky-50 rounded-xl border border-sky-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_weight_based}
                                        onChange={e => setFormData({ ...formData, is_weight_based: e.target.checked })}
                                        className="w-4 h-4 md:w-5 md:h-5 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                                    />
                                    <span className="text-sm font-semibold text-sky-700">Per Kilogram</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 md:w-5 md:h-5 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                                    />
                                    <span className="text-sm font-semibold text-sky-700">Aktif</span>
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                                >
                                    {loading ? 'Menyimpan...' : '✓ Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
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

export default ServicesIndex;