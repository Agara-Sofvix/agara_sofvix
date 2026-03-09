import React, { useState } from 'react';
import { registerUser } from '../src/services/api';
import LegalModal from './LegalModal';

interface SignupProps {
  onNavigate: (user: { name: string, token?: string, dob?: string, profilePic?: string }) => void;
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
    dob: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'none' | 'privacy' | 'terms'>('none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError("Please agree to the Terms and Conditions and Privacy Policy.");
      return;
    }

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

      onNavigate({
        name: data.name,
        token: data.token,
        dob: data.dob,
        profilePic: data.profilePic
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const PRIVACY_POLICY = (
    <>
      <p><strong>Last Updated:</strong> March 2026</p>
      <p>At Ezhuthidu.com, we respect your privacy. This Privacy Policy explains what information we collect and how we use it.</p>
      <h2>1. Information We Collect</h2>
      <p>We may collect basic information such as:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Mobile number</li>
        <li>Typing test results (WPM, accuracy, errors)</li>
      </ul>
      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide Tamil typing practice and typing tests</li>
        <li>Show tournament results and leaderboards</li>
        <li>Improve website performance</li>
        <li>Communicate with users if needed</li>
      </ul>
      <h2>3. Cookies</h2>
      <p>Our website may use cookies to improve user experience and website performance.</p>
      <h2>4. Data Security</h2>
      <p>We try our best to protect your information, but no internet system can guarantee 100% security.</p>
      <h2>5. Third-Party Links</h2>
      <p>Our website may contain links to other websites. We are not responsible for the privacy policies of those websites.</p>
      <h2>6. Policy Updates</h2>
      <p>We may update this Privacy Policy in the future. Changes will be posted on this page.</p>
      <h2>7. Contact</h2>
      <p>If you have questions about this policy, contact us at: support@ezhuthidu.com</p>
    </>
  );

  const TERMS_CONDITIONS = (
    <>
      <p><strong>Last Updated:</strong> March 2026</p>
      <p>By using Ezhuthidu.com, you agree to follow the rules and conditions listed below.</p>
      <h2>1. Website Use</h2>
      <p>Ezhuthidu.com provides Tamil typing practice, typing tests, and typing competitions to help users improve their typing skills.</p>
      <h2>2. Fair Use</h2>
      <p>Users must not:</p>
      <ul>
        <li>Use typing bots or automation tools</li>
        <li>Copy and paste during typing tests</li>
        <li>Create multiple accounts</li>
        <li>Cheat in competitions</li>
      </ul>
      <h2>3. User Accounts</h2>
      <p>Users must provide correct information and keep their login details secure.</p>
      <h2>4. Website Content</h2>
      <p>All website content including text, design, and software belongs to Ezhuthidu.com and cannot be copied without permission.</p>
      <h2>5. Service Availability</h2>
      <p>The website may sometimes be unavailable due to maintenance or technical issues.</p>
      <h2>6. Changes to Terms</h2>
      <p>We may update these Terms and Conditions at any time. Continued use of the website means you accept the updated terms.</p>
      <h2>7. Governing Law</h2>
      <p>These Terms are governed by the laws of India.</p>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-cream-light/50 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-8 md:p-10 shadow-inner w-full max-w-2xl mx-auto transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Create Your Account</h1>
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-600">Track progress. Improve speed. Master Tamil typing.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center animate-in slide-in-from-top-2 duration-300">
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

          <div className="md:col-span-2 py-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:bg-header-brown checked:border-header-brown"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] pointer-events-none">
                  check
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-normal select-none">
                I agree to the
                <button type="button" onClick={() => setModalMode('terms')} className="text-header-brown hover:underline mx-1 uppercase tracking-tighter">Terms and Conditions</button>
                and
                <button type="button" onClick={() => setModalMode('privacy')} className="text-header-brown hover:underline ml-1 uppercase tracking-tighter">Privacy Policy</button>
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <button className="w-full bg-header-brown text-white font-black py-4 rounded-xl hover:bg-header-brown/90 transition-all tracking-widest text-sm uppercase shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={!agreed}>
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

      <LegalModal
        isOpen={modalMode !== 'none'}
        onClose={() => setModalMode('none')}
        title={modalMode === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
        content={modalMode === 'terms' ? TERMS_CONDITIONS : PRIVACY_POLICY}
      />
    </div>
  );
};

export default Signup;
