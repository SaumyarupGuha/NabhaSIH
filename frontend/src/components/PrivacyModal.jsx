import React from 'react';
import { X } from 'lucide-react';

export const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-6">Last updated: January 2025</p>
            
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
              <p className="mb-3">We collect personal information, health information, and technical data to provide our telemedicine services.</p>
              <ul className="list-disc pl-5 mb-3">
                <li>Personal details (name, contact information)</li>
                <li>Health records and medical history</li>
                <li>Device and usage information</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
              <ul className="list-disc pl-5 mb-3">
                <li>Providing healthcare services and consultations</li>
                <li>Maintaining medical records</li>
                <li>Processing payments and appointments</li>
                <li>Improving our platform and services</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
              <p className="mb-3">We share information only with:</p>
              <ul className="list-disc pl-5 mb-3">
                <li>Healthcare providers involved in your care</li>
                <li>Trusted service providers under strict agreements</li>
                <li>When required by law or for safety purposes</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
              <ul className="list-disc pl-5 mb-3">
                <li>End-to-end encryption for all communications</li>
                <li>Secure data storage with regular backups</li>
                <li>Multi-factor authentication</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">5. Your Rights</h3>
              <ul className="list-disc pl-5 mb-3">
                <li>Access and download your data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Control communication preferences</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">6. Data Retention</h3>
              <p className="mb-3">We retain information as long as necessary to provide services and comply with legal obligations, following healthcare regulations.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <p className="text-sm text-gray-600">
                For privacy questions, contact our Data Protection Officer at privacy@nabhahealth.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};