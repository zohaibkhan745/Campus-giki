const fs = require('fs');

function usePortal(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { createPortal }")) {
    code = code.replace(/import React(.*?);/, "import React$1;\nimport { createPortal } from 'react-dom';");
  }
  
  if (code.includes("{isModalOpen && (")) {
    code = code.replace(/\{isModalOpen && \(/g, "{isModalOpen && createPortal(");
    code = code.replace(/<\/form>\s*<\/div>\s*<\/div>\s*\)\}/, "</form>\n          </div>\n        </div>, document.body\n      )}");
  }
  fs.writeFileSync(file, code);
}

usePortal('src/pages/admin/AdminAdvisorsPage.tsx');
