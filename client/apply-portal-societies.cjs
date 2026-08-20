const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

if (!code.includes("import { createPortal }")) {
  code = code.replace(/import React(.*?);/, "import React$1;\nimport { createPortal } from 'react-dom';");
}

code = code.replace(/\{editingSociety && \(\s*(<div className="fixed.*?<\/div>\s*)\)\}/gs, '{editingSociety && createPortal($1, document.body)}');
code = code.replace(/\{deletingSociety && \(\s*(<div className="fixed.*?<\/div>\s*)\)\}/gs, '{deletingSociety && createPortal($1, document.body)}');
code = code.replace(/\{deactivatingSociety && \(\s*(<div className="modal-overlay.*?<\/div>\s*<\/div>\s*<\/div>\s*)\)\}/gs, '{deactivatingSociety && createPortal($1, document.body)}');
code = code.replace(/\{reactivatingSociety && \(\s*(<div className="modal-overlay.*?<\/div>\s*<\/div>\s*<\/div>\s*)\)\}/gs, '{reactivatingSociety && createPortal($1, document.body)}');

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
