const fs = require('fs');

function wrapWithPortal(file, startPattern, endPattern) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { createPortal }")) {
    code = code.replace(/import React(.*?);/, "import React$1;\nimport { createPortal } from 'react-dom';");
  }
  
  if (code.includes(startPattern)) {
    // Only replace if not already wrapped
    if (!code.includes("createPortal(")) {
        // we'll just do it manually below since regex for nested brackets is hard
    }
  }
  fs.writeFileSync(file, code);
}
