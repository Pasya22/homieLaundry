// src/components/profile/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Lock,
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    ArrowLeft,
    Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    useEffect(() => {
        const user = authService.getUser();
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name,
                email: user.email,
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate password fields
        if (formData.new_password || formData.current_password) {
            if (!formData.current_password) {
                setError('Password saat ini harus diisi jika ingin mengganti password');
                setLoading(false);
                return;
            }
            if (formData.new_password.length < 8) {
                setError('Password baru minimal 8 karakter');
                setLoading(false);
                return;
            }
            if (formData.new_password !== formData.new_password_confirmation) {
                setError('Konfirmasi password tidak cocok');
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${authService.getToken()}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    ...(formData.new_password && {
                        current_password: formData.current_password,
                        new_password: formData.new_password,
                        new_password_confirmation: formData.new_password_confirmation,
                    }),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal update profile');
            }

            localStorage.setItem('user', JSON.stringify(data.data));

            setSuccess('Profile berhasil diupdate!');

            setFormData((prev) => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            }));

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Gagal update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-3 md:p-4 lg:p-6">
            {/* Header - Sky Blue Theme */}
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 md:p-2.5 bg-white hover:bg-sky-50 text-sky-600 rounded-xl border-2 border-sky-200 shadow-sm transition-all duration-200"
                        aria-label="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="p-2 md:p-3 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl shadow-lg">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                            Profile Saya
                        </h1>
                        <p className="text-xs md:text-sm text-sky-500">
                            Kelola informasi akun dan keamanan kata sandi
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-sky-100">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-sm text-sm font-semibold">
                            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-sm text-sm font-semibold">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-sky-700 mb-4 pb-2 border-b-2 border-sky-100 flex items-center gap-2">
                                <User className="w-5 h-5 text-sky-500" />
                                Informasi Personal
                            </h2>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-sky-700 mb-2">
                                        Nama Lengkap *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400 text-sm md:text-base"
                                            placeholder="Masukkan nama lengkap"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-sky-700 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400 text-sm md:text-base"
                                            placeholder="email@example.com"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-sky-700 mb-4 pb-2 border-b-2 border-sky-100 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-sky-500" />
                                Ganti Password
                            </h2>

                            <div className="space-y-4">
                                <div className="text-xs md:text-sm text-sky-700 bg-sky-50 p-3.5 rounded-xl border border-sky-200 flex items-center gap-2.5 font-medium">
                                    <Info className="w-4 h-4 text-sky-500 shrink-0" />
                                    <span>Kosongkan kolom password di bawah jika tidak ingin mengganti kata sandi.</span>
                                </div>

                                {/* Current Password */}
                                <div>
                                    <label htmlFor="current_password" className="block text-sm font-bold text-sky-700 mb-2">
                                        Password Saat Ini
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                                        <input
                                            id="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400 text-sm md:text-base"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 hover:text-sky-700 transition-colors"
                                            aria-label="Tampilkan password saat ini"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password & Confirm Password Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="new_password" className="block text-sm font-bold text-sky-700 mb-2">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                                            <input
                                                id="new_password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                name="new_password"
                                                value={formData.new_password}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-12 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400 text-sm md:text-base"
                                                placeholder="••••••••"
                                                disabled={loading}
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 hover:text-sky-700 transition-colors"
                                                aria-label="Tampilkan password baru"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-sky-500 mt-1.5">Minimal 8 karakter</p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="new_password_confirmation" className="block text-sm font-bold text-sky-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                                            <input
                                                id="new_password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="new_password_confirmation"
                                                value={formData.new_password_confirmation}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-12 py-2.5 md:py-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400 text-sm md:text-base"
                                                placeholder="••••••••"
                                                disabled={loading}
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-sky-500 hover:text-sky-700 transition-colors"
                                                aria-label="Tampilkan konfirmasi password"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t-2 border-sky-100">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;