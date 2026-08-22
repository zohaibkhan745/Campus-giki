const fs = require('fs');
const files = [
  'client/src/components/admin/FlippableAdminEventCard.tsx',
  'client/src/components/feed/EventCard.tsx',
  'client/src/components/feed/PostCard.tsx',
  'client/src/components/feed/PostCreateModal.tsx',
  'client/src/components/layout/BannerHeader.tsx',
  'client/src/pages/DashboardPage.tsx',
  'client/src/pages/admin/AdminYearlyPlanDetailPage.tsx',
  'client/src/pages/admin/AdminYearlyPlansPage.tsx',
  'client/src/pages/advisor/AdvisorPlanReviewPage.tsx',
  'client/src/pages/advisor/AdvisorQueuePage.tsx',
  'client/src/pages/events/EventDetailPage.tsx',
  'client/src/pages/societies/SocietyDirectoryPage.tsx',
  'client/src/pages/societies/SocietyProfilePage.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Replacements
  if (content.includes('.logoUrl || \\'/giki-logo.png\\'')) {
    content = content.replace(/\\b([^\\s.]+)\\.logoUrl \\|\\| \\'\\/giki-logo\\.png\\'/g, 'getSocietyLogo(.logoUrl)');
    changed = true;
  }
  if (content.includes('evt.society?.logoUrl || \\'/giki-logo.png\\'')) {
    content = content.replace(/evt\\.society\\?\\.logoUrl \\|\\| \\'\\/giki-logo\\.png\\'/g, 'getSocietyLogo(evt.society?.logoUrl)');
    changed = true;
  }
  if (content.includes('item.society?.logoUrl || \\'/giki-logo.png\\'')) {
    content = content.replace(/item\\.society\\?\\.logoUrl \\|\\| \\'\\/giki-logo\\.png\\'/g, 'getSocietyLogo(item.society?.logoUrl)');
    changed = true;
  }
  
  if (content.match(/src=\\{([^}]+)\\.logoUrl\\}/)) {
    content = content.replace(/src=\\{([^}]+)\\.logoUrl\\}/g, 'src={getSocietyLogo(.logoUrl)}');
    changed = true;
  }
  if (content.match(/src=\\{([^}]+)\\.bannerUrl\\}/)) {
    content = content.replace(/src=\\{([^}]+)\\.bannerUrl\\}/g, 'src={getSocietyBanner(.bannerUrl)}');
    changed = true;
  }
  if (content.includes('logoUrl={profile?.logoUrl} bannerUrl={profile?.bannerUrl}')) {
    content = content.replace('logoUrl={profile?.logoUrl} bannerUrl={profile?.bannerUrl}', 'logoUrl={getSocietyLogo(profile?.logoUrl)} bannerUrl={getSocietyBanner(profile?.bannerUrl)}');
    changed = true;
  }
  if (content.includes('logoUrl={plan.society.logoUrl}')) {
    content = content.replace('logoUrl={plan.society.logoUrl}', 'logoUrl={getSocietyLogo(plan.society.logoUrl)}');
    changed = true;
  }
  if (content.includes('logoUrl={event.society.logoUrl}')) {
    content = content.replace('logoUrl={event.society.logoUrl}', 'logoUrl={getSocietyLogo(event.society.logoUrl)}');
    changed = true;
  }

  // Import injection
  if (changed && !content.includes('getSocietyLogo')) {
    content = 'import { getSocietyLogo, getSocietyBanner } from \\'@/lib/utils\\';\\n' + content;
  } else if (changed && content.includes('getSocietyLogo') && !content.includes('import { getSocietyLogo')) {
    content = 'import { getSocietyLogo, getSocietyBanner } from \\'@/lib/utils\\';\\n' + content;
  }
  
  if (changed) fs.writeFileSync(f, content, 'utf8');
});
