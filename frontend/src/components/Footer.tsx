"use client";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaApple,
  FaGooglePlay
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">DigiStore</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nigeria&apos;s leading marketplace for digital products. Empowering creators to sell and buyers to discover quality digital content.
            </p>
            <div className="flex gap-4 text-xl">
              <a href="#" className="hover:text-red-400 transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <FaLinkedin />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Browse Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Become a Seller
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Payment Methods
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Report a Problem
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-400 mt-1 flex-shrink-0" />
                <span>123 Ikeja Way, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-red-400 flex-shrink-0" />
                <a href="tel:+2348012345678" className="hover:text-red-400 transition-colors">
                  +234 801 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-red-400 flex-shrink-0" />
                <a href="mailto:support@digistore.ng" className="hover:text-red-400 transition-colors">
                  support@digistore.ng
                </a>
              </li>
            </ul>

            {/* Mobile Apps */}
            <div className="mt-6 space-y-2">
              <p className="text-white font-semibold text-sm mb-3">Download Our App</p>
              <a href="#" className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs">
                <FaApple className="text-xl" />
                <div>
                  <div className="text-[10px] text-gray-400">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs">
                <FaGooglePlay className="text-lg" />
                <div>
                  <div className="text-[10px] text-gray-400">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-white font-semibold text-xl mb-2">
              Stay Updated
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest products and exclusive deals
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-400 focus:outline-none transition text-white placeholder-gray-500"
              />
              <button className="bg-red-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <p className="text-center text-gray-400 text-sm mb-4">
            We accept secure payments via
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500">
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-semibold">
              Paystack
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-semibold">
              Flutterwave
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-semibold">
              Bank Transfer
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-semibold">
              Mastercard
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-semibold">
              Visa
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} DigiStore. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-red-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}