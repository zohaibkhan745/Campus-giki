const fs = require('fs');

function applyPortal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (!code.includes("import { createPortal }")) {
    code = code.replace(/import React(.*?);/, "import React$1;\nimport { createPortal } from 'react-dom';");
  }
  
  if (code.includes('if (!isOpen) return null;\n\n  return (')) {
    code = code.replace('if (!isOpen) return null;\n\n  return (', 'if (!isOpen) return null;\n\n  return createPortal(');
    // find last `  );` before `};`
    let parts = code.split('  );\n};');
    if (parts.length === 2) {
      code = parts[0] + '  , document.body\n  );\n};';
    }
  }
  fs.writeFileSync(filePath, code);
}

applyPortal('src/components/ui/OnboardSocietyModal.tsx');
applyPortal('src/components/feed/PostCreateModal.tsx');
