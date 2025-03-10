interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-[#333333] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <h2 className="text-xl font-semibold mb-4 text-white">Terms & Conditions</h2>
          <p className="text-sm text-gray-300 mb-6">Please read our terms and conditions carefully.</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-base font-semibold mb-2 text-white">1. Acceptance of Terms</h3>
              <p className="text-sm text-gray-300">
                By accessing and using Colossus.AI, you agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2 text-white">2. Use of Service</h3>
              <p className="text-sm text-gray-300">
                You agree to use our service only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2 text-white">3. User Accounts</h3>
              <p className="text-sm text-gray-300">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2 text-white">4. Intellectual Property</h3>
              <p className="text-sm text-gray-300">
                All content, features, and functionality of Colossus.AI are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2 text-white">5. Privacy</h3>
              <p className="text-sm text-gray-300">
                Your use of Colossus.AI is also governed by our Privacy Policy. Please review our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2 text-white">6. Modifications</h3>
              <p className="text-sm text-gray-300">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <p className="text-xs text-gray-400 mt-4">
              Last updated: 2/15/2025
            </p>
          </div>

          <div className="pl-0 mt-4">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white py-2 px-4 rounded-3xl text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 