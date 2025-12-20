// src/components/profile/Profile.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
        new_password_confirmation: ''
    });

    useEffect(() => {
        // Load user data
        const user = authService.getUser();
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
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
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    ...(formData.new_password && {
                        current_password: formData.current_password,
                        new_password: formData.new_password,
                        new_password_confirmation: formData.new_password_confirmation
                    })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal update profile');
            }

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(data.data));

            setSuccess('Profile berhasil diupdate!');
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            }));

            // Redirect to dashboard after 2 seconds
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                    <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-700">Profile Saya</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Informasi Personal
                        </h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Masukkan nama lengkap"
                                    disabled={loading}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="email@example.com"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Change Password */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            Ganti Password
                        </h2>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                💡 Kosongkan jika tidak ingin mengganti password
                            </p>

                            {/* Current Password */}
                            <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="new_password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        disabled={loading}
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="new_password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="new_password_confirmation"
                                        value={formData.new_password_confirmation}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        disabled={loading}
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
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
    );
};

export default Profile;