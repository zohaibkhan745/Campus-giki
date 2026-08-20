const fs = require('fs');
let code = fs.readFileSync('src/components/ui/OnboardSocietyModal.tsx', 'utf8');

code = code.replace(/className="fixed inset-0 z-\[200\] flex items-center justify-center p-4"/, 
'className="glass-popup-overlay z-[200]"');

code = code.replace(/<div className="absolute inset-0 bg-\[#050507\]\/60 backdrop-blur-sm" onClick=\{handleClose\}><\/div>\s*<div className="relative bg-white\/\[0\.08\] backdrop-blur-\[20px\] p-6 sm:p-8 rounded-\[18px\] border border-white\/20 w-full max-w-2xl shadow-\[0_12px_40px_rgba\(0,0,0,0\.4\)\] text-left flex flex-col max-h-\[90vh\] overflow-hidden">/, 
'<div className="glass-popup-card" style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "hidden" }}>');

code = code.replace(/className="text-2xl font-extrabold text-white"/,
'className="glass-popup-title"');

code = code.replace(/className="px-5 py-2\.5 bg-transparent border border-white\/20 text-white rounded-xl hover:bg-white\/10 transition-colors font-medium text-sm"/,
'className="glass-popup-button" style={{width:"auto"}}');

code = code.replace(/className="px-5 py-2\.5 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm"/,
'className="glass-popup-button" style={{width:"auto", background:"#fff", color:"#000"}}');

fs.writeFileSync('src/components/ui/OnboardSocietyModal.tsx', code);
