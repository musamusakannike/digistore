"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyEmailToken, resendVerification } from "@/lib/endpoints";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("Verifying your email...");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const res = await verifyEmailToken(token);
        if (res?.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully.");
        } else {
          setStatus("error");
          setMessage(res?.message || "Verification failed.");
        }
      } catch (e) {
        setStatus("error");
        setMessage((e as Error).message || "Verification failed.");
      }
    };
    run();
  }, [token]);

  const handleResend = async () => {
    try {
      setResending(true);
      setResendMsg(null);
      const res = await resendVerification();
      if (res?.success) setResendMsg("Verification email sent. Please check your inbox.");
      else setResendMsg("Unable to resend verification email.");
    } catch (e) {
      setResendMsg((e as Error).message || "Unable to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h1>
        <div className={`${status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-gray-700'}`}>{message}</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => router.push('/products')} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800">Go to Store</button>
          <button onClick={() => router.push('/auth')} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Sign In</button>
        </div>
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-2">Didn&apos;t receive an email?</div>
          <button onClick={handleResend} disabled={resending} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-70">{resending ? 'Resending...' : 'Resend Verification Email'}</button>
          {resendMsg && <div className="mt-2 text-sm text-gray-700">{resendMsg}</div>}
        </div>
      </div>
    </div>
  );
}
