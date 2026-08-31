import re

path = 'client/src/pages/admin/AdminPendingEventsPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace states
c = re.sub(
    r'const \[fromDate, setFromDate\] = useState<string>\(\'\'\);\n\s*const \[toDate, setToDate\] = useState<string>\(\'\'\);',
    "const [statusFilter, setStatusFilter] = useState<string>('PENDING_ADMIN');",
    c
)

# Update queryKey and queryFn
c = re.sub(
    r"queryKey: \['adminEventsList', 'PENDING_ADMIN', societyFilter, searchQuery, fromDate, toDate, typeToggle\],",
    "queryKey: ['adminEventsList', statusFilter, societyFilter, searchQuery, typeToggle],",
    c
)
c = re.sub(
    r"status: 'PENDING_ADMIN',",
    "status: statusFilter,",
    c
)
c = re.sub(
    r"from: fromDate \|\| undefined,\n\s*to: toDate \|\| undefined,",
    "",
    c
)

# Replace the input rendering
old_inputs = r'''<div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={fromDate} onChange={\(val: string\) => { setFromDate\(val\); setTypeToggle\("all"\); /\* reset handled by queryKey \*/ }} placeholder="From Date" /></div>\s*<div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={toDate} onChange={\(val: string\) => { setToDate\(val\); setTypeToggle\("all"\); /\* reset handled by queryKey \*/ }} placeholder="To Date" /></div>'''

new_inputs = '''<div className="w-full md:w-auto shrink-0 min-w-[200px]">
          <CustomDropdown 
            value={statusFilter} 
            onChange={(e: any) => setStatusFilter(e.target.value)} 
            options={[
              { value: 'PENDING_ADMIN', label: 'Pending DSA Approval' },
              { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
            ]}
          />
        </div>'''

c = re.sub(old_inputs, new_inputs, c)

# Replace clear filter logic
c = re.sub(
    r"setFromDate\(''\);\n\s*setToDate\(''\);",
    "setStatusFilter('PENDING_ADMIN');",
    c
)
c = re.sub(
    r"\(searchQuery \|\| societyFilter \|\| fromDate \|\| toDate \|\| typeToggle !== 'all'\)",
    "(searchQuery || societyFilter || statusFilter !== 'PENDING_ADMIN' || typeToggle !== 'all')",
    c
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
