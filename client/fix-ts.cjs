const fs = require('fs');

// Fix PostCard.tsx
let post = fs.readFileSync('src/components/feed/PostCard.tsx', 'utf8');
post = post.replace(/item\.author\?\.avatarUrl/g, 'item.society?.logoUrl');
post = post.replace(/item\.author\?\.fullName/g, 'item.society?.name');
fs.writeFileSync('src/components/feed/PostCard.tsx', post);

// Fix EventCard.tsx
let event = fs.readFileSync('src/components/feed/EventCard.tsx', 'utf8');
event = event.replace(/const eventTime = item\.eventTime;/, 'const eventTime = item.startTime;');
event = event.replace(/const coverImage = item\.imageUrl;/, 'const coverImage = item.coverImageUrl;');
event = event.replace(/interface EventCardProps \{[\s\S]*?item: EventFeedItem;/m, 'interface EventCardProps {\n  item: EventFeedItem;\n  allowExpand?: boolean;');
fs.writeFileSync('src/components/feed/EventCard.tsx', event);

// Fix AdminSocietiesPage.tsx UserX issue
let soc = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');
soc = soc.replace(/<UserX className="w-3 h-3" \/>/g, '<Ban className="w-3.5 h-3.5" />');
fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', soc);
