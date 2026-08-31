import re

path = 'client/src/pages/admin/AdminDashboardPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add useState import if not present
if 'useState' not in c:
    c = c.replace('import React from', 'import React, { useState } from')
else:
    # it might be import React, { useState } already
    pass

# Add state and useQuery
state_and_query = '''
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_ADMIN');
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['dashboardEvents', statusFilter],
    queryFn: () => adminService.getAllEvents({ status: statusFilter as any, limit: 4 })
  });
  
  const pendingEvents = eventsData?.items || [];
  const isPendingLoading = isLoading || eventsLoading;
'''

c = re.sub(
    r"const pendingEvents = data\?\.pendingEventsPreview \|\| \[\];",
    state_and_query,
    c
)

# Replace the heading with heading + dropdown
old_header = '''<div className="flex items-center gap-2 font-extrabold text-lg text-white">
              <Clock className="w-5 h-5 text-white" />
              <h3>Pending Review ({pendingEvents.length})</h3>
            </div>'''

new_header = '''<div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-extrabold text-lg text-white">
                <Clock className="w-5 h-5 text-white" />
                <h3>Pending Review ({pendingEvents.length})</h3>
              </div>
              <CustomDropdown 
                className="w-auto min-w-[200px]"
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'PENDING_ADMIN', label: 'Pending DSA Approval' },
                  { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
                ]}
              />
            </div>'''

c = c.replace(old_header, new_header)

# Fix loading variable name
c = c.replace('{isLoading ? (', '{isPendingLoading ? (')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
