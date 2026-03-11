import React from 'react';
import AdSenseBlock from './AdSenseBlock';

const TermsConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white rounded-3xl shadow-xl mt-4 mb-6">
      <div className="mb-8 flex justify-center">
        <AdSenseBlock adSlot="2011121314" adFormat="auto" />
      </div>
      <h1 className="text-3xl font-black mb-8 text-slate-900 uppercase tracking-tighter">Terms & Conditions</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed font-medium">
        <p>Last updated: March 11, 2026</p>
        <p>By using Ezhuthidu, you agree to the following terms and conditions.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you may not use the services.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Use of Content</h2>
        <p>All content provided on Ezhuthidu is for educational and competitive typing purposes. You may not copy, reproduce, or distribute any content without prior written permission.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Tournament Rules</h2>
        <p>Participants in tournaments must follow the rules and fair play guidelines. Any form of cheating or automation is strictly prohibited and will result in disqualification.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
        <p>Ezhuthidu shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the services.</p>
      </div>
      <div className="mt-12 flex justify-center">
        <AdSenseBlock adSlot="2011121315" adFormat="auto" />
      </div>
    </div>
  );
};

export default TermsConditions;
