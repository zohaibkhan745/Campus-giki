import re

path = 'client/src/pages/admin/AdminDashboardPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

if 'import { CustomDropdown }' not in c:
    c = c.replace('import { BannerHeader }', 'import { BannerHeader }\nimport { CustomDropdown } from \'@/components/ui/CustomDropdown\';')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
