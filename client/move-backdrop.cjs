const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (code.includes('<div className="focus-backdrop" id="focusBackdrop"></div>')) {
  code = code.replace('<div className="focus-backdrop" id="focusBackdrop"></div>\n              <AppRoutes />', '<AppRoutes />\n              <div className="focus-backdrop" id="focusBackdrop"></div>');
  fs.writeFileSync('src/App.tsx', code);
}
