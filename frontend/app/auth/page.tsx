import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function AuthPage() {
    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-white p-4">
            <div className="w-full max-w-[600px] p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
                        </div>
                        <span className="text-xl font-bold text-gray-900">DigiStore</span>
                    </Link>
                    <div className="text-sm font-medium text-gray-500">
                        Already have an account? <Link href="/auth/signin" className="text-black font-bold hover:underline">Sign In</Link>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Sign up for an account</h1>

                <form className="space-y-6">
                    {/* Name Fields */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label htmlFor="firstName" className="text-gray-600 font-medium">First name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="First Name"
                                className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label htmlFor="lastName" className="text-gray-600 font-medium">Last name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Last Name"
                                className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-gray-600 font-medium">Phone Number</label>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
                            <div className="flex items-center justify-between px-3 py-3 border-r border-gray-200 bg-white min-w-[100px] cursor-pointer hover:bg-gray-50">
                                <span className="text-gray-900">+234</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="Phone Number"
                                className="flex-1 p-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-gray-600 font-medium">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email address"
                            className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-gray-600 font-medium">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter Password"
                            className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                        <p className="text-sm text-gray-500 mt-1">Password must be longer than 10 characters</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Sign Up
                    </button>

                    {/* Disclaimer */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                        By clicking "Next," you agree to DigiStore General <Link href="/terms" className="underline hover:text-black">Terms and Conditions</Link> and acknowledge you have read the <Link href="/privacy" className="underline hover:text-black">Privacy Policy</Link>.
                    </p>
                </form>
            </div>
        </div>
    );
}