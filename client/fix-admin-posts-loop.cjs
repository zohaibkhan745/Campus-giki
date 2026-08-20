const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminPostsPage.tsx', 'utf8');

if (!code.includes('import { PostCard } from')) {
  code = code.replace(/import \{ Button \} from '@\/components\/ui\/Button';/, "import { Button } from '@/components/ui/Button';\nimport { PostCard } from '@/components/feed/PostCard';");
}

const oldGrid = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*\)\}\s*\{\/\* Pagination \*\/\}/;

const newGrid = `<div className="cards-container" style={{ padding: 0, minHeight: 'auto', gap: '24px', alignItems: 'flex-start' }}>
          {posts.map((post) => {
            const isAdmin = post.author.role === 'DSA_ADMIN';
            const isOwnPost = isAdmin; // Since we are viewing as Admin
            
            // Format post for PostCard if needed. PostFeedItem requires society, if Admin, inject dummy society
            const feedItem = {
              ...post,
              society: post.author.society || {
                id: 'admin',
                name: 'GIKI Administration',
                description: 'Directorate of Student Affairs',
                logoUrl: '',
                coverUrl: '',
                email: 'dsa@giki.edu.pk',
                status: 'ACTIVE'
              }
            };
            
            return (
              <PostCard 
                key={post.id} 
                item={feedItem as any} 
                onEdit={isOwnPost ? () => handleOpenEdit(post) : undefined}
                onDelete={() => handleDelete(post.id)}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}`;

code = code.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/admin/AdminPostsPage.tsx', code);
