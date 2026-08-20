const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('focusBackdrop')) {
  code = code.replace(/<AppRoutes \/>/, '<div className="focus-backdrop" id="focusBackdrop"></div>\n              <AppRoutes />');
  fs.writeFileSync('src/App.tsx', code);
}
