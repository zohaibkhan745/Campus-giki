import re

path = 'client/src/lib/validations/event.schema.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('eventType: z.string().optional(),', 'eventType: z.string().min(1, \'Event Type is required\'),')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
