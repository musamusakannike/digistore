"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login:", { email: formData.email, password: formData.password });
      alert("Login successful! (Demo)");
    } else {
      console.log("Register:", formData);
      alert("Registration successful! (Demo)");
    }
  };

  const handleGoogleAuth = () => {
    console.log("Google OAuth triggered");
    alert("Google OAuth would be triggered here (Demo)");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-white to-red-50">
      <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white/70 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm">
        <h1 className="text-2xl font-bold text-red-900">DigiStore</h1>
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link href="#features" className="hover:text-red-900">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-red-900">
            Pricing
          </Link>
          <Link href="#contact" className="hover:text-red-900">
            Contact
          </Link>
        </div>
        <Link href="/" className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition">
          Back to Home
        </Link>
      </nav>

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
                    className="w-full bg-red-900 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition"
                  >
                    {isLogin ? "Login" : "Create Account"}
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