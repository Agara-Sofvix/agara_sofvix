import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Keyboard, Lock, Mail, AlertCircle } from 'lucide-react';
import { ADMIN_API_URL } from '../config/apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${ADMIN_API_URL}/auth/login`, {
                email,
                password
            });

            // API returns { success: true, data: { _id, name, email, token } }
            const userData = response.data.data || response.data;
            login(userData);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-[#92450f] flex items-center justify-center rounded-lg shadow-lg shadow-[#92450f]/20 mb-4">
                            <Keyboard className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Ezhuthidu Login</h1>
                        <p className="text-slate-500 text-sm mt-1">Sign in to manage the tournament platform</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#92450f]/50 focus:border-[#92450f] outline-none transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#92450f]/50 focus:border-[#92450f] outline-none transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#92450f] hover:bg-[#7a3a0c] text-white font-bold py-2.5 rounded-lg shadow-lg shadow-[#92450f]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Protected System • Authorized Access Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
