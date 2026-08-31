import re

path = 'client/src/pages/admin/AdminPendingEventsPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add states back
c = c.replace('const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADMIN");', 'const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADMIN");\n  const [fromDate, setFromDate] = useState<string>("");\n  const [toDate, setToDate] = useState<string>("");')

# Add from/to back to queryKey
c = c.replace("queryKey: ['adminEventsList', statusFilter, societyFilter, searchQuery, typeToggle],", "queryKey: ['adminEventsList', statusFilter, societyFilter, searchQuery, fromDate, toDate, typeToggle],")

# Add from/to back to queryFn
c = c.replace("search: searchQuery || undefined,", "search: searchQuery || undefined,\n        from: fromDate || undefined,\n        to: toDate || undefined,")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
