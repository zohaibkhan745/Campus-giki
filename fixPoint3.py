import re

path = 'client/src/components/feed/EventCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import { getSocietyLogo, cn } from \'@/lib/utils\';', 'import { getSocietyLogo, cn, resolveImageUrl } from \'@/lib/utils\';')
c = c.replace('const coverImage = item.coverImageUrl || \'https://images.unsplash.com', 'const coverImage = resolveImageUrl(item.coverImageUrl) || \'https://images.unsplash.com')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
