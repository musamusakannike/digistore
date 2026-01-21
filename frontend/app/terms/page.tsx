export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 p-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="text-white/50 mt-3">
            These terms govern your use of DigiStore, a Nigerian-focused digital products marketplace.
          </p>

          <div className="mt-10 space-y-8 text-white/70 leading-relaxed">
            <section>
              <h2 className="text-white font-bold text-lg">1. Accounts</h2>
              <p className="mt-2">
                You are responsible for safeguarding your account credentials and all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">2. Digital Products</h2>
              <p className="mt-2">
                Purchases grant you a license to use the digital product as described by the seller. Products are delivered electronically.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">3. Payments</h2>
              <p className="mt-2">
                Payments are processed in Nigerian Naira (NGN) via supported payment providers (e.g. Flutterwave).
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">4. Refunds</h2>
              <p className="mt-2">
                Refund eligibility depends on the product type and applicable policies. If available, refunds may be processed within a limited window.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">5. Seller Responsibilities</h2>
              <p className="mt-2">
                Sellers must own the rights to the products they upload and must not distribute infringing or illegal content.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-lg">6. Contact</h2>
              <p className="mt-2">For questions, visit the Help Center.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
