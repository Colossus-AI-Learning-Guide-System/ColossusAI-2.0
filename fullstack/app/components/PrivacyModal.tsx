interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
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
          <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
          <p className="text-sm text-gray-600 mb-6">Please read our privacy policy carefully.</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-base font-semibold mb-2">1. Information We Collect</h3>
              <p className="text-sm text-gray-600">
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Create an account</li>
                <li>Use our services</li>
                <li>Contact us for support</li>
                <li>Subscribe to our communications</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">2. How We Use Your Information</h3>
              <p className="text-sm text-gray-600">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">3. Information Sharing</h3>
              <p className="text-sm text-gray-600">
                We do not sell or rent your personal information to third parties. We may share your
                information with:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Service providers who assist in our operations</li>
                <li>Professional advisers</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">4. Data Security</h3>
              <p className="text-sm text-gray-600">
                We implement appropriate security measures to protect your personal information.
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">5. Your Rights</h3>
              <p className="text-sm text-gray-600">
                You have the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-2">6. Contact Us</h3>
              <p className="text-sm text-gray-600">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: colossus.ai.lk@gmail.com
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