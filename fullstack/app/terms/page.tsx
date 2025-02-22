"use client";

import Link from "next/link";

const Terms = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
      <div className="space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Colossus.AI, you agree to be bound by these Terms and Conditions.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Use of Service</h2>
        <p>You agree to use our service only for lawful purposes and in accordance with these Terms.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Intellectual Property</h2>
        <p>All content, features, and functionality of Colossus.AI are owned by us and are protected by international copyright, trademark, and other intellectual property laws.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Privacy</h2>
        <p>Your use of Colossus.AI is also governed by our Privacy Policy. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">6. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>

        <div className="mt-8 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <Link 
            href="/signup" 
            className="text-primary hover:underline block mt-4"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms; 