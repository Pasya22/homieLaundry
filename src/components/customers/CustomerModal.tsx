// src/components/customers/CustomerModal.tsx
import React, { useEffect, useRef } from 'react';
import { X, Crown, User, AlertCircle, Users } from 'lucide-react';
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

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && modal.isOpen) {
                closeModal();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                modal.isOpen
            ) {
                closeModal();
            }
        };

        if (modal.isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('mousedown', handleClickOutside);
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
        } catch {
            // Error sudah di-handle di store
        }
    };

    const handleInputChange = (field: keyof typeof form, value: string | number) => {
        setForm({ [field]: value });
    };

    return (
        <div className="fixed inset-0 bg-sky-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-sky-200 m-2 md:m-0 animate-modalIn"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header - Sky Blue Gradient */}
                <div className="p-4 md:p-6 border-b-2 border-sky-100 sticky top-0 bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-2xl md:rounded-t-3xl flex items-center justify-between z-10">
                    <h2
                        id="modal-title"
                        className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3"
                    >
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                        {modal.isEditing ? 'Edit Customer' : 'Tambah Customer'}
                    </h2>
                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={loading}
                        aria-label="Tutup modal"
                        className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-sky-700 mb-2">
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
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                            placeholder="Masukkan nama lengkap"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-sky-700 mb-2">
                            Tipe Customer *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    checked={form.type === 'regular'}
                                    onChange={() => setForm({ type: 'regular', deposit: 0 })}
                                    className="hidden peer"
                                    disabled={loading}
                                />
                                <div className="p-4 border-2 border-sky-200 rounded-xl text-center peer-checked:border-sky-500 peer-checked:bg-sky-50 transition-all duration-200 hover:border-sky-400">
                                    <User className="w-6 h-6 text-sky-600 mx-auto mb-1.5" />
                                    <p className="font-bold text-sky-900 text-sm">Regular</p>
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
                                <div className="p-4 border-2 border-sky-200 rounded-xl text-center peer-checked:border-sky-500 peer-checked:bg-gradient-to-br peer-checked:from-sky-50 peer-checked:to-blue-100 transition-all duration-200 hover:border-sky-400">
                                    <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                                    <p className="font-bold text-sky-900 text-sm">Member</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Deposit (for member only) */}
                    {form.type === 'member' && (
                        <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                            <label htmlFor="deposit" className="block text-sm font-bold text-sky-700 mb-2">
                                Deposit Awal *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-600 font-bold text-sm">
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
                                    className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                                    placeholder="0"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-sky-600 mt-1.5">
                                Deposit akan menjadi saldo awal customer
                            </p>
                        </div>
                    )}

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-sky-700 mb-2">
                            Telepon / WhatsApp
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            maxLength={20}
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm md:text-base"
                            placeholder="Contoh: 08123456789"
                            disabled={loading}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-bold text-sky-700 mb-2">
                            Alamat
                        </label>
                        <textarea
                            id="address"
                            value={form.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            maxLength={255}
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none transition-all duration-200 text-sm md:text-base"
                            placeholder="Masukkan alamat lengkap"
                            disabled={loading}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                        >
                            {loading ? 'Menyimpan...' : modal.isEditing ? '✓ Update' : '✓ Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                        >
                            ✕ Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;