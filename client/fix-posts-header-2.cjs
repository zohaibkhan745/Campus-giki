const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPostsPage.tsx', 'utf8');

// Fix Header
code = code.replace(/<div className="bg-transparent p-6 rounded-\[18px\] border border-white\/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">[\s\S]*?<Button[\s\S]*?New Global Post\s*<\/Button>\s*<\/div>/, 
  `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          Campus Posts
        </h1>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="shrink-0"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>`
);

// Fix Toolbar z-index
code = code.replace(/<div className="bg-white\/\[0\.08\] backdrop-blur-\[20px\] p-5 rounded-\[18px\] border border-white\/20 shadow-\[0_12px_40px_rgba\(0,0,0,0\.4\)\] flex flex-wrap items-center gap-4">/,
  '<div className="relative z-[200] bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-wrap items-center gap-4">'
);

fs.writeFileSync('src/pages/admin/AdminPostsPage.tsx', code);
console.log('Fixed AdminPostsPage header and toolbar');
