// src/components/customers/CustomerModal.tsx
import React, { useEffect, useRef } from 'react';
import { X, Save, Crown, User, AlertCircle } from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';

const CustomerModal: React.FC = () => {
    const {
        modal,
        form,
        loading,
        error,
        closeModal,
        setForm,
        createCustomer,
        updateCustomer,
    } = useCustomerStore();

    const modalRef = useRef<HTMLDivElement>(null);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && modal.isOpen) {
                closeModal();
            }
        };

        // Handle click outside modal
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                modal.isOpen) {
                closeModal();
            }
        };

        if (modal.isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('mousedown', handleClickOutside);

            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('mousedown', handleClickOutside);

            // Restore body scroll when modal is closed
            document.body.style.overflow = 'auto';
        };
    }, [modal.isOpen, closeModal]);

    if (!modal.isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modal.isEditing) {
                await updateCustomer();
            } else {
                await createCustomer();
            }
        } catch (error) {
            // Error sudah di-handle di store
        }
    };

    // Handle form field changes
    const handleInputChange = (field: keyof typeof form, value: string | number) => {
        setForm({ [field]: value });
    };

    return (
        <>
            {/* Backdrop dengan Blur Effect */}
            <div
                className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    ref={modalRef}
                    className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h2 id="modal-title" className="text-xl font-bold text-blue-700">
                            {modal.isEditing ? 'Edit Customer' : 'Tambah Customer Baru'}
                        </h2>
                        <button
                            onClick={closeModal}
                            className="text-gray-500 hover:text-gray-700 p-1 transition duration-200 rounded-full hover:bg-gray-100"
                            disabled={loading}
                            aria-label="Tutup modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Lengkap *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={form.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                minLength={2}
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Masukkan nama lengkap"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipe Customer *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={form.type === 'regular'}
                                        onChange={() => {
                                            setForm({ type: 'regular', deposit: 0 });
                                        }}
                                        className="hidden peer"
                                        disabled={loading}
                                    />
                                    <div className="p-4 border-2 border-gray-300 rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 transition duration-200 hover:border-blue-400">
                                        <User className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                        <p className="font-medium">Regular</p>
                                    </div>
                                </label>
                                <label className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={form.type === 'member'}
                                        onChange={() => setForm({ type: 'member' })}
                                        className="hidden peer"
                                        disabled={loading}
                                    />
                                    <div className="p-4 border-2 border-gray-300 rounded-lg text-center peer-checked:border-green-500 peer-checked:bg-green-50 transition duration-200 hover:border-green-400">
                                        <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                        <p className="font-medium">Member</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Deposit (for member only) */}
                        {form.type === 'member' && (
                            <div>
                                <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deposit Awal *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        Rp
                                    </span>
                                    <input
                                        id="deposit"
                                        type="number"
                                        value={form.deposit}
                                        onChange={(e) => handleInputChange('deposit', parseFloat(e.target.value) || 0)}
                                        required
                                        min="0"
                                        step="1000"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="0"
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Deposit akan menjadi saldo awal customer
                                </p>
                            </div>
                        )}

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Telepon
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                maxLength={20}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Contoh: 08123456789"
                                disabled={loading}
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <textarea
                                id="address"
                                value={form.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={3}
                                maxLength={255}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition duration-200"
                                placeholder="Masukkan alamat lengkap"
                                disabled={loading}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-500 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {modal.isEditing ? 'Update' : 'Simpan'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="flex-1 bg-gray-500 bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CustomerModal;