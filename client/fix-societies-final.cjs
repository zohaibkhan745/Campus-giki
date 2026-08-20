const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// Replace UserX with Ban in imports
code = code.replace(/UserX,/, 'Ban,');

// Replace table header Department
code = code.replace(/<th className="p-\[15px\] text-slate-400 text-\[13px\] uppercase tracking-\[1px\] border-b border-white\/10 w-\[15%\]">Department<\/th>/, '');

// Replace table data Department
code = code.replace(/<td className="py-\[18px\] px-\[15px\] text-\[15px\] border-b border-white\/5 text-slate-300 group-last:border-b-0">\s*\{society\.advisor\?\.department \|\| <span className="text-slate-500 italic">-<\/span>\}\s*<\/td>/, '');

// Replace Ban button
const oldBanBtn = /<button\s*onClick=\{\(\) => setDeactivatingSociety\(society\)\}\s*className="px-2\.5 py-1 rounded-lg text-\[11px\] font-bold transition-all flex items-center gap-1 bg-transparent text-red-400 border border-red-500\/30 hover:bg-red-500\/20"\s*title="Ban Society"\s*>\s*<UserX className="w-3 h-3" \/>\s*Ban\s*<\/button>/;

const newBanBtn = `<button
                                onClick={() => setDeactivatingSociety(society)}
                                className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold transition-all flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 shadow-md"
                                title="Ban Society"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Ban
                              </button>`;
                              
code = code.replace(oldBanBtn, newBanBtn);

// Also remove DSA Administration text block and fix the Heading size.
// The current heading structure is probably:
// <div className="bg-transparent p-6 rounded-[18px] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// But wait, the user didn't mention DSA Administration in Societies page. He said: "make the society management heding larger like other headings like campus feed and the same placement position like campus feed as well"
// Let's check how the heading is structured right now.
fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
