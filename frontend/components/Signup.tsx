
import React, { useState } from 'react';
import { registerUser } from '../src/services/api';

interface SignupProps {
  onNavigate: (user: { name: string, token?: string, dob?: string }) => void;
  onLoginNavigate: () => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigate, onLoginNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    dob: '',
    experience: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const data = await registerUser({
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dob: formData.dob
      });

      onNavigate({ name: data.name, token: data.token });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-cream-light/50 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-8 md:p-10 shadow-inner w-full max-w-2xl mx-auto transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Create Your Account</h1>
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-600">Track progress. Improve speed. Master Tamil typing.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Full Name *</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              placeholder="Enter your full name"
              required
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Email Address *</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              placeholder="email@example.com"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Password *</label>
            <div className="relative">
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all pr-12 placeholder:text-slate-400"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
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
            <div className="text-[10px] font-medium opacity-60 mt-1.5 flex items-center gap-1 text-slate-600">
              <span className="material-symbols-outlined text-xs">info</span>
              Min. 8 characters with upper, lower, and numbers
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Confirm Password *</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              required
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Username *</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              placeholder="e.g. tamil_typist99"
              required
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Date of Birth *</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
              required
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-700">Typing experience level</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all appearance-none cursor-pointer text-slate-800"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              >
                <option value="" disabled>Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-gray-500">expand_more</span>
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <button className="w-full bg-header-brown text-white font-black py-4 rounded-xl hover:bg-header-brown/90 transition-all tracking-widest text-sm uppercase shadow-lg active:scale-[0.98]" type="submit">
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-bold opacity-60 text-slate-700">
            Already have an account? <button onClick={onLoginNavigate} className="text-black font-black hover:underline ml-1 uppercase tracking-widest">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
