
import React, { useState } from 'react';
import { resetPassword } from '../src/services/api';

interface ResetPasswordProps {
    email: string;
    onLoginNavigate: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email, onLoginNavigate }) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword({
                email,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => {
                onLoginNavigate();
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-cream-light/50 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-8 md:p-12 shadow-inner w-full max-w-md mx-auto transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Set New Password</h1>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-600">Enter a new secure password for {email}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-bold text-center">
                        Password reset successful! Redirecting to login...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">New Password</label>
                        <div className="relative">
                            <input
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all pr-12 placeholder:text-slate-400"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading || success}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 hover:text-black transition-colors"
                                disabled={loading || success}
                            >
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Confirm Password</label>
                        <input
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            disabled={loading || success}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading || success}
                            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-all tracking-widest text-sm uppercase shadow-lg active:scale-[0.98] disabled:opacity-50"
                            type="submit"
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={onLoginNavigate} className="text-xs font-black text-slate-700 hover:text-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
