import re

paths = [
    'client/src/pages/admin/AdminEventReviewPage.tsx',
    'client/src/pages/advisor/AdvisorEventReviewPage.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    c = c.replace("{...register('eventType')}", "value={eventData.eventType}")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
