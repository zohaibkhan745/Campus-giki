const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

// Replace standard panels with glass cards
code = code.replace(
  /className="bg-lumen-cream p-6 rounded-cards border border-vast-ink\/20 space-y-5"/g,
  'className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-5 text-left"'
);

// Also replace the header banner in SettingsPage
code = code.replace(
  /className="flex items-center gap-4 bg-transparent p-6 rounded-cards border border-vast-ink\/20"/g,
  'className="flex items-center gap-4 relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white"'
);

// We need to replace the vast-ink text colors inside the cards with white
code = code.replace(/text-vast-ink/g, 'text-white');
code = code.replace(/text-fog/g, 'text-gray-300');
code = code.replace(/text-indigo-600/g, 'text-indigo-300');

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
