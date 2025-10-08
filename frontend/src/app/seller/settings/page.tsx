"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, becomeSeller, updateBankDetails } from "@/lib/endpoints";
import type { User } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";

export default function SellerSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Become seller form
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  // Update bank details form
  const [ubBankName, setUbBankName] = useState("");
  const [ubAccountNumber, setUbAccountNumber] = useState("");
  const [ubAccountName, setUbAccountName] = useState("");
  const [ubBusy, setUbBusy] = useState(false);
  const [ubMsg, setUbMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) return router.push("/auth");
        const u = await getProfile();
        setUser(u);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleBecomeSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo(null);
    setError(null);
    try {
      setBusy(true);
      const res = await becomeSeller({
        businessName,
        businessDescription,
        bankDetails: {
          bankName,
          accountNumber,
          accountName,
        },
      });
      setUser(res);
      setInfo("Your account has been updated. If required, you may need to verify your email or await approval.");
      setBusinessName("");
      setBusinessDescription("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
    } catch (e) {
      setError((e as Error).message || "Failed to submit become seller request");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setUbMsg(null);
    setError(null);
    try {
      setUbBusy(true);
      await updateBankDetails({ bankName: ubBankName, accountNumber: ubAccountNumber, accountName: ubAccountName });
      setUbMsg("Bank details updated.");
      setUbBankName("");
      setUbAccountNumber("");
      setUbAccountName("");
    } catch (e) {
      setError((e as Error).message || "Failed to update bank details");
    } finally {
      setUbBusy(false);
    }
  };

  const isSeller = user?.role === "seller" || user?.role === "admin";

  if (loading) return <div className="pt-32 pb-12 px-6">Loading settings...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {!isSeller && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Become a Seller</h2>
            <p className="text-gray-600 mb-4">Provide your business info and bank details to enable selling.</p>
            {info && <div className="mb-3 text-sm text-green-700">{info}</div>}
            <form onSubmit={handleBecomeSeller} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} required rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <button type="submit" disabled={busy} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{busy ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bank Details</h2>
          <p className="text-gray-600 mb-4">Update your bank details for payouts.</p>
          {ubMsg && <div className="mb-3 text-sm text-green-700">{ubMsg}</div>}
          <form onSubmit={handleUpdateBank} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input value={ubBankName} onChange={(e) => setUbBankName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input value={ubAccountNumber} onChange={(e) => setUbAccountNumber(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input value={ubAccountName} onChange={(e) => setUbAccountName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <button type="submit" disabled={ubBusy} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{ubBusy ? 'Updating...' : 'Update'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
