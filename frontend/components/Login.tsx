
import React, { useState } from 'react';
import { loginUser } from '../src/services/api';

interface LoginProps {
  onNavigate: (user: { name: string, token?: string }) => void;
  onSignupNavigate: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, onSignupNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser({
        username: formData.username,
        password: formData.password
      });

      onNavigate({ name: data.name, token: data.token });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-cream-light/50 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-8 md:p-12 shadow-inner w-full max-w-md mx-auto transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Welcome Back</h1>
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-600">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Username</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              placeholder="e.g. tamil_typist99"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Password</label>
            <div className="relative">
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all pr-12 placeholder:text-slate-400"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 hover:text-black transition-colors"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary transition-all"
                type="checkbox"
              />
              <span className="text-xs font-bold opacity-70 text-slate-700 group-hover:opacity-100 transition-opacity">Remember me</span>
            </label>
            <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot Password?</a>
          </div>

          <div className="pt-2">
            <button className="w-full bg-header-brown text-white font-black py-4 rounded-xl hover:bg-header-brown/90 transition-all tracking-widest text-sm uppercase shadow-lg active:scale-[0.98]" type="submit">
              Login
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-bold opacity-60 text-slate-700">
            New user? <button onClick={onSignupNavigate} className="text-black font-black hover:underline ml-1 uppercase tracking-widest">Create an Account</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
