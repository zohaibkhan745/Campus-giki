const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminYearlyPlansPage.tsx', 'utf8');

const oldStatusSelect = /<div className="relative flex items-center w-full sm:w-44">[\s\S]*?<Filter className="w-4 h-4" \/>[\s\S]*?<\/div>[\s\S]*?<select[\s\S]*?value=\{statusFilter\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?setStatusFilter\(e\.target\.value\);[\s\S]*?setPage\(1\);[\s\S]*?\}\}[\s\S]*?className="[\s\S]*?"\s*>[\s\S]*?<option value="">All Submitted Plans<\/option>[\s\S]*?<option value="PENDING">Pending Review<\/option>[\s\S]*?<option value="APPROVED">Approved<\/option>[\s\S]*?<option value="CHANGES_REQUESTED">Changes Requested<\/option>[\s\S]*?<\/select>[\s\S]*?<\/div>/;

const newStatusDropdown = `<div className="w-full sm:w-48 shrink-0">
            <CustomDropdown
              icon={<Filter className="w-4 h-4" />}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              placeholder="All Submitted Plans"
              options={[
                { value: '', label: 'All Submitted Plans' },
                { value: 'PENDING', label: 'Pending Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
              ]}
            />
          </div>`;

code = code.replace(oldStatusSelect, newStatusDropdown);

const oldYearSelect = /<div className="relative flex items-center w-full sm:w-36">[\s\S]*?<Calendar className="w-4 h-4" \/>[\s\S]*?<\/div>[\s\S]*?<select[\s\S]*?value=\{yearFilter\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?setYearFilter\(e\.target\.value\);[\s\S]*?setPage\(1\);[\s\S]*?\}\}[\s\S]*?className="[\s\S]*?"\s*>[\s\S]*?<option value="">All Years<\/option>[\s\S]*?<option value="2026">2026<\/option>[\s\S]*?<option value="2025">2025<\/option>[\s\S]*?<option value="2024">2024<\/option>[\s\S]*?<option value="2027">2027<\/option>[\s\S]*?<\/select>[\s\S]*?<\/div>/;

const newYearDropdown = `<div className="w-full sm:w-40 shrink-0">
            <CustomDropdown
              icon={<Calendar className="w-4 h-4" />}
              value={yearFilter}
              onChange={(val) => { setYearFilter(val); setPage(1); }}
              placeholder="All Years"
              options={[
                { value: '', label: 'All Years' },
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
                { value: '2027', label: '2027' }
              ]}
            />
          </div>`;

code = code.replace(oldYearSelect, newYearDropdown);

fs.writeFileSync('src/pages/admin/AdminYearlyPlansPage.tsx', code);
