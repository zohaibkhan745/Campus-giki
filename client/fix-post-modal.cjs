const fs = require('fs');

let code = fs.readFileSync('src/components/feed/PostCreateModal.tsx', 'utf8');

// Container
code = code.replace(
  /className="bg-lumen-cream w-full max-w-xl rounded-\[28px\] p-6 shadow-2xl relative border border-vast-ink\/20 flex flex-col justify-between min-h-\[300px\] transition-all"/,
  'className="w-full max-w-xl rounded-[18px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20 bg-white/[0.08] backdrop-blur-[20px] text-white relative flex flex-col justify-between min-h-[300px] transition-all"'
);

// Title / Avatar Text
code = code.replace(/text-slate-900/g, 'text-white');

// Textarea
code = code.replace(
  /className="w-full text-slate-800 text-base placeholder:text-slate-400 placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"/,
  'className="w-full text-white text-base placeholder:text-gray-400 placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"'
);

// Bottom border
code = code.replace(/border-slate-100\/80/g, 'border-white/20');

// Icons
code = code.replace(/text-slate-700 hover:text-slate-900 hover:bg-slate-100/g, 'text-gray-300 hover:text-white hover:bg-white/10');

// Cancel button
code = code.replace(
  /className="px-6 py-2\.5 bg-\[#F3F4F6\] text-\[#374151\] hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"/,
  'className="px-6 py-2.5 bg-white/10 text-white hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors border border-white/20"'
);

// Submit button
code = code.replace(
  /className="px-6 py-2\.5 rounded-xl text-sm font-semibold transition-all shadow-none disabled:bg-\[#F0F0F0\] disabled:text-\[#B0B0B0\] disabled:cursor-not-allowed bg-\[#18181B\] text-white hover:bg-slate-800"/,
  'className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-100"'
);

fs.writeFileSync('src/components/feed/PostCreateModal.tsx', code);
