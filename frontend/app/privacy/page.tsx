export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 p-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-white/50 mt-3">
            This policy explains how DigiStore collects, uses, and protects your information.
          </p>

          <div className="mt-10 space-y-8 text-white/70 leading-relaxed">
            <section>
              <h2 className="text-white font-bold text-lg">1. Information We Collect</h2>
              <p className="mt-2">
                We collect account information, purchase history, and usage data to operate and improve the marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">2. Payments</h2>
              <p className="mt-2">
                Payment processing is handled by third-party providers. We do not store full card details.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">3. Cookies</h2>
              <p className="mt-2">
                We use cookies for authentication, security, and to improve user experience.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">4. Data Security</h2>
              <p className="mt-2">
                We take reasonable measures to protect your data, but no method of transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">5. Contact</h2>
              <p className="mt-2">For privacy questions, visit the Help Center.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
