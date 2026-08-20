const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminYearlyPlansPage.tsx', 'utf8');

// Ensure CustomDropdown is imported
if (!code.includes('CustomDropdown')) {
  code = code.replace(/import \{ Link, useSearchParams, useNavigate \} from 'react-router-dom';/, "import { Link, useSearchParams, useNavigate } from 'react-router-dom';\nimport { CustomDropdown } from '@/components/ui/CustomDropdown';");
}

// Fix Header
const oldHeader = /<div className="space-y-1 bg-transparent p-6 rounded-cards border border-white\/10">[\s\S]*?<\/div>/;
const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          Campus Society Yearly Plan Records
        </h1>
      </div>`;
code = code.replace(oldHeader, newHeader);

// Replace Toolbar wrapper
code = code.replace(/<div className="bg-\[#17181c\]\/80 backdrop-blur-md p-4 rounded-cards border border-white\/10 flex flex-col md:flex-row items-center justify-between gap-4">/, 
  '<div className="relative z-[200] bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center justify-between gap-4">');

// We have two selects. Let's find and replace them precisely.
// Actually, it's easier to just replace the whole `<div className="flex flex-wrap items-center gap-3 w-full md:w-auto"> ... </div>` area maybe? Let's check the context for selects first.
fs.writeFileSync('src/pages/admin/AdminYearlyPlansPage.tsx', code);
