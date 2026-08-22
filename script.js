const fs = require('fs');
let code = fs.readFileSync('client/src/lib/utils.ts', 'utf8');
code = code.replace(/return \\;/g, 'return baseUrl + (url.startsWith(\\'/\\') ? \\'\\' : \\'/\\') + url;');
fs.writeFileSync('client/src/lib/utils.ts', code, 'utf8');

