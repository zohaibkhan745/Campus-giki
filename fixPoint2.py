import re

path = 'client/src/lib/validations/event.schema.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('End time must be strictly after start time', 'End time must be after start time')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
