"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile, uploadAvatarFile, changePasswordApi } from "@/lib/endpoints";
import type { User } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) return router.push("/auth");
        const u = await getProfile();
        console.log("user: ", JSON.stringify(u, null, 2))
        setUser(u);
        console.log("first name:", u.firstName)
        setFirstName(u.firstName);
        setLastName(u.lastName);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile({ firstName, lastName });
      setUser(updated);
    } catch (e) {
      alert((e as Error).message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const updated = await uploadAvatarFile(file);
      setUser(updated);
    } catch (er) {
      alert((er as Error).message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPwdError(null);
      setPwdSuccess(null);
      setPwdLoading(true);
      await changePasswordApi({ currentPassword, newPassword });
      setPwdSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPwdError((e as Error).message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="pt-32 pb-12 px-6">Loading profile...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {user?.avatar ? (
                <Image src={user.avatar} alt={`${user.firstName} ${user.lastName}`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">NA</div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}</div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Change Avatar</label>
            <input type="file" accept="image/*" onChange={handleAvatar} disabled={saving} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
          <label className="block text-sm mb-1">First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <button onClick={handleSave} disabled={saving} className="mt-4 bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{saving ? "Saving..." : "Save Changes"}</button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
          <label className="block text-sm mb-1">Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <button onClick={handleSave} disabled={saving} className="mt-4 bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{saving ? "Saving..." : "Save Changes"}</button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          {pwdError && <div className="mb-2 text-sm text-red-700">{pwdError}</div>}
          {pwdSuccess && <div className="mb-2 text-sm text-green-700">{pwdSuccess}</div>}
          <label className="block text-sm mb-1">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <label className="block text-sm mb-1 mt-3">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <button onClick={handleChangePassword} disabled={pwdLoading} className="mt-4 bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{pwdLoading ? "Please wait..." : "Update Password"}</button>
        </div>
      </div>
    </div>
  );
}
