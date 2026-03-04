
import React, { useState } from 'react';
import { verifyOTP } from '../src/services/api';

interface VerifyOTPProps {
    email: string;
    onResetNavigate: (email: string) => void;
    onLoginNavigate: () => void;
}

const VerifyOTP: React.FC<VerifyOTPProps> = ({ email, onResetNavigate, onLoginNavigate }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await verifyOTP(email, otp);
            setSuccess(true);
            setTimeout(() => {
                onResetNavigate(email);
            }, 1000);
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
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Enter OTP</h1>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-600">A 6-digit code has been sent to {email}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-bold text-center">
                        OTP Verified! Redirecting...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">6-Digit Code</label>
                        <input
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-center tracking-[1em] focus:border-primary focus:ring-0 transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                            placeholder="123456"
                            maxLength={6}
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            disabled={loading || success}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading || success}
                            className="w-full bg-header-brown text-white font-black py-4 rounded-xl hover:bg-header-brown/90 transition-all tracking-widest text-sm uppercase shadow-lg active:scale-[0.98] disabled:opacity-50"
                            type="submit"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
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

export default VerifyOTP;
