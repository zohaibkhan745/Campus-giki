import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="global-footer" className="bg-[#0b0c10] text-[#9ca3af] pt-16 pb-12 border-t border-[#1f2937]/60 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-[#1f2937]/60">
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
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Services</a></li>
              <li><a href="#" className="hover:text-white transition">Products</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>123 Innovation Street</li>
              <li>Tech City, TC 12345</li>
              <li>Phone: (123) 456-7890</li>
              <li>Email: hello@example.com</li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex items-center space-x-3">
                <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>
              </div>
            </div>
            {/* Theme Toggle placeholder */}
            <div className="flex items-center space-x-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <button type="button" className="w-12 h-6 bg-white rounded-full p-0.5 flex items-center justify-end focus:outline-none">
                <div className="w-5 h-5 bg-black rounded-full shadow-md"></div>
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-4 md:space-y-0">
          <div>
            &copy; 2026 GIKI Campus. All rights reserved.
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
