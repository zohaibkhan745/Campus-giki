const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

const buttonPattern = /<Button[\s\S]*?className=\"border-red-500\/30[^>]+>[\s\S]*?Delete[\s\S]*?<\/Button>/;
code = code.replace(buttonPattern, '');

code = code.replace(/import \{ Alert \} from '@\/components\/ui\/Alert';/, `import { Alert } from '@/components/ui/Alert';\nimport { NotificationPill } from '@/components/ui/NotificationPill';`);

code = code.replace(/\{actionError && <Alert variant="error" message=\{actionError\} \/>\}/, `<NotificationPill state={actionError ? 'failed' : null} message={actionError || ''} onClose={() => setActionError(null)} />`);

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
console.log('Fixed AdminSocietiesPage');
