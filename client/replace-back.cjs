const fs = require('fs');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}
const files = walk('src/pages');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const oldClassStr = 'className="absolute top-4 left-4 z-50 inline-flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full transition-all cursor-pointer shadow-lg"';
    const newClassStr = 'className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"';
    
    if (content.includes(oldClassStr)) {
        content = content.split(oldClassStr).join(newClassStr);
        fs.writeFileSync(file, content);
    }
});
console.log('Fixed back buttons to be fixed position.');
