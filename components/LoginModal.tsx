
import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Loader2, Lock, Mail, X } from 'lucide-react';

interface LoginModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            setAuth(user, token);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Login failed:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal login. Periksa email & password.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                    title="Close"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-pawon-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-pawon-accent" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-pawon-dark">Admin Login</h2>
                    <p className="text-sm text-gray-500">Masuk untuk mengelola restoran</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pawon-accent/50 focus:border-pawon-accent transition-all"
                                placeholder="nama@contoh.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pawon-accent/50 focus:border-pawon-accent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-pawon-dark text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Masuk Dashboard'}
                    </button>
                </form>

            </div>
        </div>
    );
};
