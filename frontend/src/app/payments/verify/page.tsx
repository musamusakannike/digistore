"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/lib/endpoints";

export default function PaymentVerifyPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const ref = sp.get("tx_ref") || sp.get("reference") || sp.get("ref");
      if (!ref) {
        setError("Missing payment reference");
        setLoading(false);
        return;
      }
      try {
        const res = await verifyPayment(ref);
        setStatus(res.status);
        setLinks(res.downloadLinks || []);
      } catch (e) {
        setError((e as Error).message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sp]);

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Verification</h1>
        {loading && <div>Verifying payment...</div>}
        {!loading && error && (
          <div className="text-red-700">{error}</div>
        )}
        {!loading && !error && (
          <div>
            <div className={status === 'successful' ? 'text-green-700' : 'text-gray-800'}>
              Status: <span className="font-semibold capitalize">{status}</span>
            </div>
            {status === 'successful' && links.length > 0 && (
              <div className="mt-4 text-left">
                <div className="font-medium mb-2">Download Links</div>
                <ul className="list-disc list-inside space-y-1">
                  {links.map((href, i) => (
                    <li key={i}>
                      <a href={href} className="text-maroon-700 hover:underline" target="_blank" rel="noreferrer">File {i + 1}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => router.push('/orders')} className="mt-6 bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800">Go to Orders</button>
          </div>
        )}
      </div>
    </div>
  );
}
