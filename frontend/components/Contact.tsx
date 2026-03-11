import React, { useState } from 'react';
import AdSenseBlock from './AdSenseBlock';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white rounded-3xl shadow-xl mt-4 mb-6">
      <div className="mb-8 flex justify-center">
        <AdSenseBlock adSlot="3011121314" adFormat="auto" />
      </div>
      <h1 className="text-3xl font-black mb-8 text-slate-900 uppercase tracking-tighter">Contact Us</h1>
      {submitted ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
          <h2 className="text-2xl font-bold text-slate-900">Message Sent!</h2>
          <p className="text-slate-600 mt-2">Thank you for reaching out. We will get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Your Name"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="your@email.com"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Message</label>
            <textarea
              required
              rows={5}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
              placeholder="How can we help you?"
              value={formState.message}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Send Message
          </button>
        </form>
      )}
      <div className="mt-12 flex justify-center">
        <AdSenseBlock adSlot="3011121315" adFormat="auto" />
      </div>
    </div>
  );
};

export default Contact;
