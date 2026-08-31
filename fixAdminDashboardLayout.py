import re

path = 'client/src/pages/admin/AdminDashboardPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_block = '''<div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
              <div className="flex items-center gap-4">
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
              </div>
              <Link to="/admin/events/pending" className="px-4 py-2 bg-white text-gray-900 border border-transparent rounded-xl text-sm font-bold shadow-md hover:bg-gray-100 transition-all">
                View All
              </Link>
            </div>'''

new_block = '''<div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-lg text-white">
                <Clock className="w-5 h-5 text-white" />
                <h3>Pending Review ({pendingEvents.length})</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <CustomDropdown 
                  className="w-auto min-w-[200px]"
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'PENDING_ADMIN', label: 'Pending DSA Approval' },
                    { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
                  ]}
                />
                <Link to="/admin/events/pending" className="px-4 py-2 bg-white text-gray-900 border border-transparent rounded-xl text-sm font-bold shadow-md hover:bg-gray-100 transition-all">
                  View All
                </Link>
              </div>
            </div>'''

c = c.replace(old_block, new_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
