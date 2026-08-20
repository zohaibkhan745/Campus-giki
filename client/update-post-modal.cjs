const fs = require('fs');
let code = fs.readFileSync('src/components/feed/PostCreateModal.tsx', 'utf8');

code = code.replace(/className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950\/40 animate-in fade-in duration-200"/, 
'className="glass-popup-overlay"');

code = code.replace(/className="w-full max-w-xl rounded-\[18px\] p-6 shadow-\[0_12px_40px_rgba\(0,0,0,0.4\)\] border border-white\/20 bg-white\/\[0.08\] backdrop-blur-\[20px\] text-white relative flex flex-col justify-between min-h-\[300px\] transition-all"/, 
'className="glass-popup-card" style={{ maxWidth: "550px" }}');

code = code.replace(/className="px-6 py-2\.5 bg-white\/10 text-white hover:bg-white\/20 rounded-xl text-sm font-semibold transition-colors border border-white\/20"/, 
'className="glass-popup-button" style={{width: "auto"}}');

code = code.replace(/className="px-6 py-2\.5 rounded-xl text-sm font-semibold transition-all shadow-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-100"/, 
'className="glass-popup-button" style={{width: "auto", background: "rgba(255,255,255,0.9)", color: "#000"}}');

fs.writeFileSync('src/components/feed/PostCreateModal.tsx', code);
