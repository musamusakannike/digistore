import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 p-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Help Center</h1>
          <p className="text-white/50 mt-3">
            Get help with purchases, downloads, seller onboarding, and account security.
          </p>

          <div className="mt-10 space-y-8">
            <section className="border border-white/10 bg-white/5 p-6">
              <h2 className="text-white font-bold">Downloads</h2>
              <p className="text-white/60 mt-2">
                After payment, your files become available in your Orders page.
              </p>
              <Link href="/orders" className="inline-flex mt-4 text-white font-bold hover:underline">
                Go to Orders
              </Link>
            </section>

            <section className="border border-white/10 bg-white/5 p-6">
              <h2 className="text-white font-bold">Payments</h2>
              <p className="text-white/60 mt-2">
                Payments are processed in NGN. If verification fails, you can retry checkout.
              </p>
              <Link href="/checkout" className="inline-flex mt-4 text-white font-bold hover:underline">
                Go to Checkout
              </Link>
            </section>

            <section className="border border-white/10 bg-white/5 p-6">
              <h2 className="text-white font-bold">Seller Onboarding</h2>
              <p className="text-white/60 mt-2">
                Become a seller from Settings, then upload products and submit them for review.
              </p>
              <Link href="/seller/dashboard" className="inline-flex mt-4 text-white font-bold hover:underline">
                Go to Seller Dashboard
              </Link>
            </section>

            <section className="border border-white/10 bg-white/5 p-6">
              <h2 className="text-white font-bold">Account Security</h2>
              <p className="text-white/60 mt-2">
                If you forgot your password, request a reset link.
              </p>
              <Link href="/auth/forgot-password" className="inline-flex mt-4 text-white font-bold hover:underline">
                Reset Password
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
