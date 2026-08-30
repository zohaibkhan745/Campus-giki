import re

path = 'client/src/pages/events/EditEventPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('onClick={handleSubmit((data) => onSubmit(data, false))}', 'onClick={handleSubmit((data) => onSubmit(data, false), onError)}')
c = c.replace('onClick={handleSubmit((data) => onSubmit(data, true))}', 'onClick={handleSubmit((data) => onSubmit(data, true), onError)}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
