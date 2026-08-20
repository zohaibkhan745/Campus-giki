const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

const renderStart = code.indexOf('return (\n    <div className="max-w-6xl');
const codeBeforeRender = code.substring(0, renderStart);

const renderEnd = code.lastIndexOf('{/* Edit Society Modal */}');
const modalsCode = code.substring(renderEnd);

const newRender = `return (
    <div className="w-full h-full flex flex-col items-center py-10 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-[95%] max-w-[1200px] bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-[30px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-[25px] gap-4">
          <h2 className="text-[24px] font-bold text-white m-0">Societies Management</h2>
          <div className="flex items-center gap-3">
            <Link to="/admin/societies/create">
              <button className="bg-blue-500 text-white border-none py-[10px] px-[18px] rounded-[12px] text-[14px] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px]">
                + Add Society
              </button>
            </Link>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold animate-pulse">Loading societies...</div>
        ) : societies.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Building2 className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Societies Found</h3>
            <p className="text-sm text-slate-400 font-medium max-w-md">
              No campus societies match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[8%]">Sr.</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Society</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Advisor</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[22%]">Email</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%]">Department</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%] text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {societies.map((society, index) => {
                  let statusText = 'Active';
                  let statusClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  
                  if (society.status === 'INACTIVE') {
                    statusText = 'Banned';
                    statusClass = 'bg-red-500/20 text-red-400 border-red-500/30';
                  } else if (society.hasWarning) {
                    statusText = 'Warning';
                    statusClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  }

                  return (
                    <tr key={society.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOpenEdit(society)}>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                        {String(index + 1 + (page - 1) * 10).padStart(2, '0')}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-white font-bold group-last:border-b-0">
                        {society.name}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                        {society.advisor?.user.fullName || <span className="text-slate-500 italic">None</span>}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                        {society.advisor?.user.email ? (
                          <a href={\`mailto:\${society.advisor.user.email}\`} className="text-slate-300 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                            {society.advisor.user.email}
                          </a>
                        ) : <span className="text-slate-500 italic">-</span>}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                        {society.advisor?.department || <span className="text-slate-500 italic">-</span>}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-center group-last:border-b-0">
                        <span className={\`inline-block px-[14px] py-[6px] rounded-[20px] text-[12px] font-bold border \${statusClass}\`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-slate-300 hover:text-white disabled:opacity-50 font-bold px-4 py-2">Prev</button>
            <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-slate-300 hover:text-white disabled:opacity-50 font-bold px-4 py-2">Next</button>
          </div>
        )}
      </div>

      `;

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', codeBeforeRender + newRender + modalsCode);
