interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
          <p className="text-sm text-gray-600 mb-6">Please read our terms and conditions carefully.</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-base font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-sm text-gray-600">
                By accessing and using Colossus.AI, you agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">2. Use of Service</h3>
              <p className="text-sm text-gray-600">
                You agree to use our service only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">3. User Accounts</h3>
              <p className="text-sm text-gray-600">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">4. Intellectual Property</h3>
              <p className="text-sm text-gray-600">
                All content, features, and functionality of Colossus.AI are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">5. Privacy</h3>
              <p className="text-sm text-gray-600">
                Your use of Colossus.AI is also governed by our Privacy Policy. Please review our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">6. Modifications</h3>
              <p className="text-sm text-gray-600">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <p className="text-xs text-gray-500 mt-4">
              Last updated: 2/15/2025
            </p>
          </div>

          <div className="pl-0 mt-2">
            <button
              onClick={onClose}
              className="w-20 bg-[#FF69B4] text-white py-3 px-3 rounded-md text-xs font-normal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 