import React from 'react';
import AdSenseBlock from './AdSenseBlock';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white rounded-3xl shadow-xl mt-8">
      <div className="mb-8 flex justify-center">
        <AdSenseBlock adSlot="1011121314" adFormat="auto" />
      </div>
      <h1 className="text-3xl font-black mb-8 text-slate-900 uppercase tracking-tighter">Privacy Policy</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed font-medium">
        <p>Last updated: March 11, 2026</p>
        <p>Welcome to Ezhuthidu. We value your privacy and are committed to protecting your personal data.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, such as when you create an account, participate in tournaments, or contact us. This may include your name, email address, and typing performance data.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, including tracking your typing progress and managing tournaments.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Third-Party Services</h2>
        <p>We use third-party services such as Google AdSense and Google Analytics. These services may collect information sent by your browser as part of a web page request, such as cookies or your IP request.</p>
        
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@ezhuthidu.com.</p>
      </div>
      <div className="mt-12 flex justify-center">
        <AdSenseBlock adSlot="1011121315" adFormat="auto" />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
