// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.login(formData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand & Info */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/5"></div>
                    <div className="absolute bottom-40 right-32 w-96 h-96 rounded-full bg-white/5"></div>
                    <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-white/5"></div>
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <img
                                src="/Logo-min-asli.png"
                                alt="Homie Laundry Logo"
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Homie Laundry</h1>
                            <p className="text-sky-200 text-sm">Management System</p>
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="max-w-lg mt-16">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-sky-100 text-lg leading-relaxed">
                            Sistem manajemen laundry terintegrasi untuk mengoptimalkan operasional
                            dan meningkatkan produktivitas bisnis Anda.
                        </p>
                    </div>
                </div>

                {/* Features List */}
                <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-white">📊</span>
                            </div>
                            <p className="text-sm text-sky-100">Analitik Real-time</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-white">⚡</span>
                            </div>
                            <p className="text-sm text-sky-100">Proses Cepat</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-white">🔒</span>
                            </div>
                            <p className="text-sm text-sky-100">Data Aman</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo & Title */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="w-24 h-24 mb-4">
                            <img
                                src="/Logo-min-asli.png"
                                alt="Homie Laundry Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-sky-900 mb-2">Homie Laundry</h1>
                        <p className="text-sky-600 text-center">Masuk untuk mengakses dashboard sistem</p>
                    </div>

                    {/* Welcome Text - Desktop */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold text-sky-900 mb-3">Login ke Sistem</h2>
                        <p className="text-sky-600">Masukkan kredensial Anda untuk melanjutkan</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-sky-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sky-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400"
                                    placeholder="admin@homie.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-sky-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sky-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sky-900 placeholder-sky-400"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ?
                                        <EyeOff className="w-5 h-5" /> :
                                        <Eye className="w-5 h-5" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </div>
                            ) : (
                                'Masuk ke Dashboard'
                            )}
                        </button>
                    </form>

                    {/* Footer - Stay at bottom */}
                    <div className="mt-12 pt-8 border-t border-sky-100">
                        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-sky-500 gap-2">
                            <p>© 2024 Homie Laundry Management System</p>
                            <p>Version 1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive Background Elements */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sky-50 to-transparent pointer-events-none lg:hidden" />
        </div>
    );
};

export default Login;