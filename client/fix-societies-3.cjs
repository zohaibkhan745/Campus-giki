const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// 1. Heading larger and placement
const oldHeader = /<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">\s*<h1 className="text-4xl font-extrabold text-white">[\s\S]*?<\/div>/;
const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          Societies Management
        </h1>
        <button
          onClick={() => setIsAddSocietyModalOpen(true)}
          className="bg-white text-black border-none py-[10px] px-[18px] rounded-[12px] text-[14px] font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:-translate-y-[2px] shadow-lg shrink-0"
        >
          + Onboard Society
        </button>
      </div>`;
code = code.replace(oldHeader, newHeader);

// 2. Remove Department from table header
code = code.replace(/<th className="px-6 py-4 font-semibold text-left border-b border-white\/10">DEPARTMENT<\/th>/, '');
// Remove department from rows
code = code.replace(/<td className="px-6 py-4 text-gray-300 text-sm whitespace-nowrap">[\s\S]*?<\/td>/, (match) => {
  // Wait, there might be multiple tds.
  return '<!-- removed department -->';
}); // This is risky with regex.

// Let's rewrite the whole table rendering part if needed.
