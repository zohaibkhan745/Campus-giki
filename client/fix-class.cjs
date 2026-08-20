const fs = require('fs');
let code = fs.readFileSync('src/components/feed/PostCard.tsx', 'utf8');
code = code.replace(/class="/g, 'className="');
fs.writeFileSync('src/components/feed/PostCard.tsx', code);
