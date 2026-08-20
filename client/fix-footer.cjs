const fs = require('fs');
['src/layouts/DashboardLayout.tsx', 'src/layouts/RootLayout.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/className="relative z-20 flex-1 min-w-0 /g, 'className="relative z-20 flex-1 min-w-0 min-h-[100vh] ');
  fs.writeFileSync(file, code);
});
