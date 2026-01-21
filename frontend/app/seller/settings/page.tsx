"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type ProfileUser = {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  isEmailVerified: boolean;
  phone?: string;
  bio?: string;
  businessName?: string;
  businessDescription?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
};

export default function SellerSettingsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isSellerOrAdmin = useMemo(() => user?.role === "seller" || user?.role === "admin", [user?.role]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        const res = await apiFetch<{ user: ProfileUser }>("/users/profile", { method: "GET" });
        if (!mounted) return;
        setProfile(res.user);
        setFirstName(res.user.firstName || "");
        setLastName(res.user.lastName || "");
        setPhone(res.user.phone || "");
        setBio(res.user.bio || "");
        setBusinessName(res.user.businessName || "");
        setBusinessDescription(res.user.businessDescription || "");
        setBankName(res.user.bankDetails?.bankName || "");
        setAccountNumber(res.user.bankDetails?.accountNumber || "");
        setAccountName(res.user.bankDetails?.accountName || "");
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      setError(null);
      setSuccess(null);
      const payload: any = { firstName, lastName, phone, bio };
      if (isSellerOrAdmin) {
        payload.businessName = businessName;
        payload.businessDescription = businessDescription;
      }
      const res = await apiFetch<{ user: ProfileUser }>("/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProfile(res.user);
      await refreshProfile();
      setSuccess("Profile updated successfully");
    } catch (e: any) {
      setError(e?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBank = async () => {
    try {
      setIsSavingBank(true);
      setError(null);
      setSuccess(null);
      const res = await apiFetch<{ bankDetails: ProfileUser["bankDetails"] }>("/users/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, accountNumber, accountName }),
      });
      setProfile((prev) => (prev ? { ...prev, bankDetails: res.bankDetails as any } : prev));
      setSuccess("Bank details updated successfully");
    } catch (e: any) {
      setError(e?.message || "Failed to update bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      setError(null);
      setSuccess(null);
      await apiFetch("/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessDescription,
          bankDetails: { bankName, accountNumber, accountName },
        }),
      });
      await refreshProfile();
      setSuccess("Successfully upgraded to seller account");
      router.push("/seller/dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to upgrade to seller");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 text-white flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1">Update your profile and payout details.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-200">{error}</div>
      ) : null}
      {success ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white/80">{success}</div>
      ) : null}

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
        <div className="text-white font-semibold mb-4">Profile</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Email</label>
            <input
              value={profile?.email || ""}
              readOnly
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white/60"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-white/60">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 min-h-24"
            />
          </div>

          {isSellerOrAdmin ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Business name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Business description</label>
                <input
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="px-5 py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-70"
          >
            {isSavingProfile ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
        <div className="text-white font-semibold mb-4">Payout details</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Bank name</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Account number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Account name</label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {isSellerOrAdmin ? (
            <button
              onClick={handleSaveBank}
              disabled={isSavingBank}
              className="px-5 py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-70"
            >
              {isSavingBank ? "Saving..." : "Save bank details"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="px-5 py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-70"
            >
              {isUpgrading ? "Upgrading..." : "Become a seller"}
            </button>
          )}
        </div>

        {!isSellerOrAdmin ? (
          <div className="mt-4 text-white/50 text-sm">
            Your email must be verified before upgrading.
          </div>
        ) : null}
      </div>
    </div>
  );
}
