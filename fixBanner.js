const fs = require('fs');
let c = fs.readFileSync('client/src/components/layout/BannerHeader.tsx', 'utf8');

c = c.replace(
  'onError={(e) => { e.currentTarget.src = \'/default-banner.png\'; }}', 
  'onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = \'/default-banner.png\'; }}'
);

c = c.replace(
  'onError={(e) => { e.currentTarget.src = fallbackImage; }}',
  'onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }}'
);

fs.writeFileSync('client/src/components/layout/BannerHeader.tsx', c);
