import re

path = 'client/src/pages/admin/AdminPendingEventsPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const [fromDate, setFromDate] = useState<string>(defaultFrom);', 'const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADMIN");')
c = c.replace('const [toDate, setToDate] = useState<string>(defaultTo);', '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
