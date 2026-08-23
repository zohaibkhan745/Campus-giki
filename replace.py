import sys
import re

with open('client/src/pages/admin/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'(?m)^(\s*)({\/\*\s*Upcoming Events\s*\*\/})',
    r'\1<hr className="border-white/10" />\n\n\1\2',
    content
)

with open('client/src/pages/admin/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
