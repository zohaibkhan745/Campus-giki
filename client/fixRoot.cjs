const fs = require('fs');
let code = fs.readFileSync('src/layouts/RootLayout.tsx', 'utf8');

code = code.replace(/style=\{\{ backgroundImage: \"url\('\\\/bg-template\.avif'\)\", backgroundColor: \"#0b0c0e\" \}\}/, '');
code = code.replace(/<div className=\"absolute inset-0 bg-\\[#050507\\]\\/80 backdrop-blur-sm z-0 pointer-events-none\"><\\/div>/, '');

fs.writeFileSync('src/layouts/RootLayout.tsx', code);
console.log('Fixed RootLayout background');
