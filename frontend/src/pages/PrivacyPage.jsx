import React from 'react';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Card>
          <CardContent className="prose prose-gray max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Nabha Health ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our telemedicine platform and related services.
              </p>
              <p className="mb-4">
                This policy complies with applicable data protection laws, including the Information Technology Act, 2000, and the Personal Data Protection Bill of India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Name, age, gender, and contact information</li>
                <li>Government-issued identification numbers</li>
                <li>Address and location data</li>
                <li>Emergency contact information</li>
                <li>Payment and billing information</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 Health Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Medical history and current health conditions</li>
                <li>Symptoms, diagnoses, and treatment plans</li>
                <li>Prescription and medication information</li>
                <li>Laboratory results and medical images</li>
                <li>Consultation records and communications</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.3 Technical Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Device information and IP addresses</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information for the following purposes:</p>
              
              <h3 className="text-xl font-medium mb-3">3.1 Healthcare Services</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Providing telemedicine consultations and medical services</li>
                <li>Maintaining your medical records and health history</li>
                <li>Coordinating care between healthcare providers</li>
                <li>Processing prescriptions and medication orders</li>
                <li>Scheduling appointments and sending reminders</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">3.2 Platform Operations</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Account creation and authentication</li>
                <li>Payment processing and billing</li>
                <li>Customer support and communication</li>
                <li>Platform security and fraud prevention</li>
                <li>Legal compliance and regulatory reporting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-medium mb-3">4.1 Healthcare Providers</h3>
              <p className="mb-4">
                We share relevant health information with licensed healthcare providers involved in your care, including doctors, pharmacists, and medical specialists within our network.
              </p>

              <h3 className="text-xl font-medium mb-3">4.2 Service Providers</h3>
              <p className="mb-4">
                We may share information with trusted third-party service providers who assist us in operating our platform, processing payments, or providing customer support, subject to strict confidentiality agreements.
              </p>

              <h3 className="text-xl font-medium mb-3">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose information when required by law, court order, or government regulation, or when necessary to protect the rights, property, or safety of our users or the public.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">We implement comprehensive security measures to protect your information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>End-to-end encryption for all communications</li>
                <li>Secure data storage with regular backups</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Staff training on data protection and privacy</li>
                <li>Compliance with healthcare data security standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              
              <h3 className="text-xl font-medium mb-3">6.1 Access and Portability</h3>
              <p className="mb-4">
                You can request access to your personal and health information and obtain copies in a portable format.
              </p>

              <h3 className="text-xl font-medium mb-3">6.2 Correction and Updates</h3>
              <p className="mb-4">
                You can request corrections to inaccurate information and update your personal details through your account settings.
              </p>

              <h3 className="text-xl font-medium mb-3">6.3 Deletion</h3>
              <p className="mb-4">
                You can request deletion of your account and personal information, subject to legal and medical record retention requirements.
              </p>

              <h3 className="text-xl font-medium mb-3">6.4 Communication Preferences</h3>
              <p className="mb-4">
                You can opt out of non-essential communications while maintaining access to important medical and service-related notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide services and comply with legal obligations. Medical records are retained in accordance with applicable healthcare regulations and professional standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="mb-4">
                Your information is primarily stored and processed within India. Any international transfers are conducted with appropriate safeguards and in compliance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under 13 years of age. For minors between 13-18 years, we require parental or guardian consent before collecting any personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of material changes through email or prominent notices on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Data Protection Officer</strong></p>
                <p>Nabha Health</p>
                <p>Nabha, Punjab, India</p>
                <p>Email: privacy@nabhahealth.com</p>
                <p>Phone: +91-XXXXX-XXXXX</p>
                <p className="mt-2 text-sm">
                  <strong>Response Time:</strong> We will respond to your privacy requests within 30 days.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}