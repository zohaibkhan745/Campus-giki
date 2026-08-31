const fs = require('fs');
let file = 'client/src/pages/societies/SocietyEventsPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'className="flex flex-col md:flex-row flex-wrap items-center gap-4 w-full lg:w-auto"',
  'className="flex flex-row items-center gap-2 sm:gap-4 w-full lg:w-auto"'
);
c = c.replace(
  /<CustomDropdown className="w-full md:w-auto shrink-0"/g,
  '<CustomDropdown className="flex-1 min-w-0 w-auto shrink-0"'
);

fs.writeFileSync(file, c);
