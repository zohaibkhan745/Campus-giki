const fs = require('fs');

let drop = fs.readFileSync('src/components/ui/CustomDropdown.tsx', 'utf8');
drop = drop.replace(/rounded-lg/g, 'rounded-[18px]');
fs.writeFileSync('src/components/ui/CustomDropdown.tsx', drop);

let dir = fs.readFileSync('src/pages/societies/SocietyDirectoryPage.tsx', 'utf8');
dir = dir.replace(/variant="ghost" /g, '');
fs.writeFileSync('src/pages/societies/SocietyDirectoryPage.tsx', dir);
