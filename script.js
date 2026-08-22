const fs = require('fs');
let code = fs.readFileSync('server/src/modules/societies/societies.service.ts', 'utf8');

// For create:
code = code.replace(/presidentContact: dto.presidentContact \\|\\| null,/g, 'presidentContact: dto.presidentContact || null,\\n            presidentEmail: dto.presidentEmail || null,\\n            presidentFaculty: dto.presidentFaculty || null,');

// For update:
code = code.replace(/\\.\\.\\.\\(dto.presidentContact !== undefined && \\{\\n\\s*presidentContact: dto.presidentContact \\|\\| null,\\n\\s*\\}\\),/g, '...(dto.presidentContact !== undefined && {\\n            presidentContact: dto.presidentContact || null,\\n          }),\\n          ...(dto.presidentEmail !== undefined && {\\n            presidentEmail: dto.presidentEmail || null,\\n          }),\\n          ...(dto.presidentFaculty !== undefined && {\\n            presidentFaculty: dto.presidentFaculty || null,\\n          }),');

fs.writeFileSync('server/src/modules/societies/societies.service.ts', code, 'utf8');

