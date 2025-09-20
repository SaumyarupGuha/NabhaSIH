import React from 'react';
import { X } from 'lucide-react';

export const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Terms of Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-6">Last updated: January 2025</p>
            
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="mb-3">By accessing and using the Nabha Health telemedicine platform, you accept and agree to be bound by these terms.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">2. Medical Disclaimer</h3>
              <p className="mb-3">The information provided is for informational purposes only and is not intended as a substitute for professional medical advice. In case of emergency, immediately call local emergency services.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">3. User Responsibilities</h3>
              <ul className="list-disc pl-5 mb-3">
                <li>Provide accurate information during registration</li>
                <li>Maintain account security</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">4. Healthcare Provider Responsibilities</h3>
              <ul className="list-disc pl-5 mb-3">
                <li>Maintain valid medical licenses</li>
                <li>Provide services within scope of practice</li>
                <li>Maintain patient confidentiality</li>
                <li>Follow established medical standards</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">5. Limitation of Liability</h3>
              <p className="mb-3">Nabha Health shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the service.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">6. Governing Law</h3>
              <p className="mb-3">These Terms are governed by the laws of India and subject to the jurisdiction of courts in Punjab, India.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <p className="text-sm text-gray-600">
                For questions about these Terms, contact us at legal@nabhahealth.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};