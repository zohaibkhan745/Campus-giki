import re

path = 'server/src/modules/events/events.service.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('? \\'PENDING_DSA\\' :', '? \\'PENDING_ADMIN\\' :')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
