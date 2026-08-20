const fs = require('fs');
let soc = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');
soc = soc.replace(/<UserX/g, '<Ban');
fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', soc);
