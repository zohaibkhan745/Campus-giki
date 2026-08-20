const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAdvisorsPage.tsx', 'utf8');

code = code.replace(/className="fixed inset-0 z-\[200\] flex items-center justify-center bg-black\/60 backdrop-blur-sm p-4"/, 
'className="glass-popup-overlay"');

code = code.replace(/className="relative z-1 w-full max-w-md p-8 rounded-\[18px\] bg-white\/\[0.08\] backdrop-blur-\[20px\] border border-white\/20 shadow-\[0_12px_40px_rgba\(0,0,0,0.4\)\] text-white space-y-5 text-left"/, 
'className="glass-popup-card" style={{ maxWidth: "550px" }}');

code = code.replace(/className="font-extrabold text-white text-xl border-b border-white\/10 pb-3 flex items-center gap-2"/,
'className="glass-popup-title"');

code = code.replace(/className="bg-transparent text-white border-white\/20 hover:bg-white\/10"/,
'className="glass-popup-button" style={{width:"auto"}}');

code = code.replace(/className="bg-white text-black hover:bg-gray-100 border-none"/,
'className="glass-popup-button" style={{width:"auto", background:"#fff", color:"#000"}}');

fs.writeFileSync('src/pages/admin/AdminAdvisorsPage.tsx', code);
