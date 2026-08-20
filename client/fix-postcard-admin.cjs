const fs = require('fs');

let code = fs.readFileSync('src/components/feed/PostCard.tsx', 'utf8');

code = code.replace(/interface PostCardProps \{/, `import { Edit2, Trash2 } from 'lucide-react';\n\ninterface PostCardProps {`);
code = code.replace(/item: PostFeedItem;/, `item: PostFeedItem;\n  onEdit?: () => void;\n  onDelete?: () => void;`);
code = code.replace(/export const PostCard: React\.FC<PostCardProps> = \(\{ item \}\) => \{/, `export const PostCard: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {`);

// Add Admin actions to glass-header-area
code = code.replace(/<h3 className="glass-title">\{authorName\}<\/h3>/, `<div className="flex justify-between items-start w-full">
                  <h3 className="glass-title">{authorName}</h3>
                  {(onEdit || onDelete) && (
                    <div className="flex items-center gap-1 z-30">
                      {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/70 hover:text-white transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>}
                      {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/70 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  )}
                </div>`);

// Add Admin actions to user-profile
code = code.replace(/<div className="profile-header">\s*<img src=\{logoImage\} alt=\{authorName\} className="avatar" \/>\s*<div className="author-name-group">\s*<span className="author-name">\{authorName\}<\/span>\s*<span className="post-timestamp">Posted: \{formattedDate\}<\/span>\s*<\/div>\s*<\/div>/, `<div className="profile-header flex justify-between w-full">
                <div className="flex items-center gap-3">
                  <img src={logoImage} alt={authorName} className="avatar" />
                  <div className="author-name-group">
                    <span className="author-name">{authorName}</span>
                    <span className="post-timestamp">Posted: {formattedDate}</span>
                  </div>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex items-center gap-1 z-30 mr-2">
                    {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/80 hover:text-white bg-black/20 rounded-full transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>}
                    {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/80 hover:text-red-400 bg-black/20 rounded-full transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                )}
              </div>`);

fs.writeFileSync('src/components/feed/PostCard.tsx', code);
