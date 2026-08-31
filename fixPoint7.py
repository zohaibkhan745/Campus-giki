import re

path = 'client/src/components/feed/PostCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<p className="front-description" ref={frontDescRef}>{item.content}</p>', '<p className="front-description whitespace-pre-wrap" ref={frontDescRef}>{item.content}</p>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
