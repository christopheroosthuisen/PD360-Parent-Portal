
import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-800 bg-white rounded-3xl shadow-sm border-2 border-pd-lightest animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black mb-2 tracking-tight text-pd-darkblue">Privacy Policy</h1>
        <p className="text-gray-500">Last Updated: {lastUpdated}</p>
        <p className="mt-4 text-lg font-medium text-pd-teal">
          The Short Version: We use your data to train your dog and improve our services. We do not sell your data.
        </p>
      </header>

      <section className="space-y-8">
        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">1. Who We Are</h2>
          <p className="mb-2 text-pd-slate leading-relaxed">
            <strong>Partners Animal Institute, Inc.</strong> (d.b.a <strong>Partners Dog Training</strong>) is an Arizona C-Corporation committed to protecting your privacy.
          </p>
          <p className="text-pd-slate leading-relaxed">
            This policy explains how we collect, use, and safeguard your information when you use our web application. By using our service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">2. Data We Collect & How We Use It</h2>
          <div className="bg-pd-lightest/30 p-4 rounded-lg border border-pd-lightest mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-pd-softgrey">The Vibe Check</span>
            <p className="text-pd-slate font-medium">We only collect what we need to make the app work and to help your dog.</p>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-pd-slate marker:text-pd-teal">
            <li><strong>Identity Data:</strong> Name, email, and phone number (Managed via Google Firebase).</li>
            <li><strong>Pet Data:</strong> Dog names, breeds, medical history, and behavioral logs (Stored in HubSpot).</li>
            <li><strong>Usage Data:</strong> How you interact with our AI features to improve the user experience.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">3. AI & Data Improvement</h2>
          <p className="mb-4 text-pd-slate leading-relaxed">
            We use Artificial Intelligence to generate training insights and improve our business processes.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-pd-slate marker:text-pd-teal">
            <li><strong>Internal Improvement:</strong> We may use anonymized training logs and user interactions to refine our internal AI models (Legitimate Interest).</li>
            <li><strong>No Third-Party Sales:</strong> We <strong>do not sell</strong> your personal data to third-party data brokers or marketing firms.</li>
            <li><strong>AI Processors:</strong> We may transmit text inputs to providers like OpenAI or Google Gemini for processing. We do not allow these providers to use your personal data to train their public models.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">4. Your Tech Stack (Third Parties)</h2>
          <p className="text-pd-slate mb-2">We trust the following industry standards to keep your data secure:</p>
          <ul className="list-disc pl-5 mt-2 text-pd-slate marker:text-pd-teal">
            <li><strong>Google Firebase:</strong> Authentication & Hosting.</li>
            <li><strong>HubSpot:</strong> Customer Database (CRM).</li>
            <li><strong>Google Cloud:</strong> Backend Security & Compute.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">5. Arizona & GDPR Privacy Rights</h2>
          <p className="mb-2 text-pd-slate">
             Regardless of where you live, we extend key privacy rights to all our users:
          </p>
           <ul className="list-disc pl-5 mb-4 text-pd-slate marker:text-pd-teal">
            <li><strong>Access & Correction:</strong> You can view and edit your profile data at any time.</li>
            <li><strong>Right to be Forgotten:</strong> You may request full account deletion by contacting support.</li>
          </ul>
          <p className="text-pd-slate leading-relaxed">
            <strong>Arizona Residents:</strong> In compliance with A.R.S. § 18-552, we maintain strict security protocols. In the unlikely event of a security breach that compromises your personal information, we will notify you within 45 days of determination.
          </p>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-3 text-pd-darkblue">6. Contact Us</h2>
          <p className="text-pd-slate">If you have questions about this policy, please contact us:</p>
          <address className="mt-4 not-italic text-pd-slate border-l-4 border-pd-yellow pl-4 py-2">
            <strong>Partners Animal Institute, Inc.</strong><br />
            Attn: Privacy Officer<br />
            123 Training Way<br />
            Scottsdale, AZ 85255<br />
            Email: privacy@partnersdogs.com
          </address>
        </div>
      </section>
    </div>
  );
};
