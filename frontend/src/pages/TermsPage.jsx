import React from 'react';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Card>
          <CardContent className="prose prose-gray max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using the Nabha Health telemedicine platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Medical Disclaimer</h2>
              <p className="mb-4">
                The information provided through this Service is for informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
              <p className="mb-4">
                In case of a medical emergency, immediately call your local emergency services or go to the nearest emergency room. Do not rely on telemedicine services for emergency medical situations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and identification</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Not impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Healthcare Provider Responsibilities</h2>
              <p className="mb-4">Healthcare providers using this platform agree to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Maintain valid medical licenses and certifications</li>
                <li>Provide services within their scope of practice</li>
                <li>Maintain patient confidentiality in accordance with applicable laws</li>
                <li>Follow established medical standards and protocols</li>
                <li>Report any technical issues that may affect patient care</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as outlined in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                To the fullest extent permitted by applicable law, Nabha Health shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain continuous service availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Nabha Health and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be interpreted and governed by the laws of India. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Punjab, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Nabha Health</strong></p>
                <p>Nabha, Punjab, India</p>
                <p>Email: legal@nabhahealth.com</p>
                <p>Phone: +91-XXXXX-XXXXX</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}