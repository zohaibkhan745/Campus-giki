import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer id="global-footer" className="bg-[#0b0c10] text-[#9ca3af] pt-16 pb-12 border-t border-[#1f2937]/60 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-16 border-b border-[#1f2937]/60">
          {/* Column 1: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white leading-tight">
              Stay<br />Connected
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="relative flex items-center max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#111318] text-sm text-white placeholder-gray-500 rounded-lg px-4 py-2.5 pr-12 border border-gray-800 focus:outline-none focus:border-gray-600"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-2 bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition"
              >
                <svg className="w-4 h-4 transform rotate-45 -translate-y-0.5 translate-x-px" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition">Services</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>GIK Institute of Engineering Sciences and Technology,</li>
              <li>Topi 23640, District Swabi, Khyber Pakhtunkhwa, Pakistan.</li>
              <li>Telephone: +92 938 281026 (Exchange)</li>
              <li>Fax: 0938-281032, 281041</li>
              <li>Email: u2023050@giki.edu.pk, u2023787@giki.edu.pk</li>
            </ul>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-4 md:space-y-0">
          <div>
            &copy; 2026 GIKI Campus. All rights reserved.
          </div>
          <div className="flex space-x-6 text-gray-400">
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/cookie-settings" className="hover:text-white transition">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
