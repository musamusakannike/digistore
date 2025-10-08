"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
// import Link from "next/link";
import { authLogin, authRegister } from "@/lib/endpoints";
import { setTokens } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await authLogin({ email: formData.email, password: formData.password });
        setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      } else {
        const res = await authRegister({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password });
        setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      }
      router.push(isLogin ? "/products" : "/auth/verify-email");
    } catch (err) {
      setError((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    console.log("Google OAuth triggered");
    alert("Google OAuth would be triggered here (Demo)");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="pt-28 pb-12 px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  isLogin
                    ? "bg-red-900 text-white"
                    : "text-gray-600 hover:text-red-900"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  !isLogin
                    ? "bg-red-900 text-white"
                    : "text-gray-600 hover:text-red-900"
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isLogin
                    ? "Login to access your digital store"
                    : "Join thousands of Nigerian creators"}
                </p>
                {error && (
                  <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
                )}

                <div className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                        />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-red-900 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-red-900 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
                  </button>
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-500 text-sm">OR</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <button
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaGoogle className="text-xl" />
                  Continue with Google
                </button>

                <p className="text-center text-sm text-gray-600 mt-6">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-red-900 font-medium hover:underline"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            🔒 Secure authentication • 🇳🇬 Made for Nigerian creators
          </div>
        </motion.div>
      </div>
    </div>
  );
}