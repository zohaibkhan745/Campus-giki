import sys
import re

with open('client/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'(?m)^(\s*)({\/\*\s*Next Upcoming Column\s*\*\/})',
    r'\1<hr className="border-white/10" />\n\n\1\2',
    content
)

content = content.replace(
    'pendingEvents.map',
    'pendingEvents.slice(0, 4).map'
)

content = content.replace(
    'upcomingEvents.map',
    'upcomingEvents.slice(0, 4).map'
)

with open('client/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
