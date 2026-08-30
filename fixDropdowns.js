const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/onChange=\{\(val: string\) => \{\n                  if \(val === 'Custom \(Add\)'\) \{/g, 'onChange={(e: any) => { const val = typeof e === \\'string\\' ? e : e.target.value; if (val === \\'Custom (Add)\\') {');
  c = c.replace(/onChange=\{\(val: string\) => handleSelectPlannedEvent\(val\)\}/g, 'onChange={(e: any) => handleSelectPlannedEvent(typeof e === \\'string\\' ? e : e.target.value)}');
  fs.writeFileSync(file, c);
}

fixFile('client/src/pages/events/CreateEventPage.tsx');
fixFile('client/src/pages/events/EditEventPage.tsx');
