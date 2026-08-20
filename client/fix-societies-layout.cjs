const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// Fix the root wrapper
code = code.replace(/<div className="w-full h-full flex flex-col items-center py-10 font-sans">/, '<div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative px-4">');

// The inner wrappers
code = code.replace(/<div className="w-\[95%\] max-w-\[1200px\] flex justify-between items-center mb-6">/, '<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">');
code = code.replace(/<div className="w-\[95%\] max-w-\[1200px\] bg-white\/\[0\.08\] backdrop-blur-\[20px\] rounded-\[24px\] p-\[30px\] shadow-\[0_12px_40px_rgba\(0,0,0,0\.4\)\] border border-white\/20">/, '<div className="w-full bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20 overflow-x-auto">');

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
console.log('Fixed Societies Layout');
