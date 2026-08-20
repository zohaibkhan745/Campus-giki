const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminAdvisorsPage.tsx', 'utf8');

// Ensure CustomDropdown is imported
if (!code.includes('CustomDropdown')) {
  code = code.replace(/import { Alert } from '@\/components\/ui\/Alert';/, "import { Alert } from '@/components/ui/Alert';\nimport { CustomDropdown } from '@/components/ui/CustomDropdown';");
}

// Table Header
code = code.replace(/<th className="p-\[15px\] text-slate-400 text-\[13px\] uppercase tracking-\[1px\] border-b border-white\/10 w-\[15%\]">Department<\/th>/, '<th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%]">Faculty</th>');

// Form Designation & Department (Faculty) Inputs
const oldInputs = /<div className="grid grid-cols-2 gap-4">[\s\S]*?<Input[\s\S]*?name="designation"[\s\S]*?\/>[\s\S]*?<Input[\s\S]*?name="department"[\s\S]*?\/>[\s\S]*?<\/div>/;

const newInputs = `<div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Designation
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'Lecturer', label: 'Lecturer' },
                      { value: 'Assistant Professor', label: 'Assistant Professor' },
                      { value: 'Associate Professor', label: 'Associate Professor' },
                      { value: 'Professor', label: 'Professor' }
                    ]}
                    value={formData.designation}
                    onChange={(val) => setFormData(prev => ({ ...prev, designation: val }))}
                    placeholder="Select..."
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Faculty
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'FCSE', label: 'FCSE' },
                      { value: 'FEE', label: 'FEE' },
                      { value: 'FCVE', label: 'FCVE' },
                      { value: 'FME', label: 'FME' },
                      { value: 'FCME', label: 'FCME' },
                      { value: 'FMTE', label: 'FMTE' },
                      { value: 'MGS', label: 'MGS' }
                    ]}
                    value={formData.department}
                    onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                    placeholder="Select..."
                  />
                </div>
              </div>`;

code = code.replace(oldInputs, newInputs);

fs.writeFileSync('src/pages/admin/AdminAdvisorsPage.tsx', code);
