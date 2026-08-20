const fs = require('fs');

function replaceClasses(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/glass-popup-overlay/g, 'modal-overlay active');
  code = code.replace(/glass-popup-card/g, 'modal-box');
  code = code.replace(/glass-popup-title/g, 'modal-title');
  code = code.replace(/glass-popup-description/g, 'modal-description');
  code = code.replace(/<div className="flex justify-end gap-3 pt-2">/g, '<div className="modal-actions">');
  code = code.replace(/className="glass-popup-button success"/g, 'className="btn-confirm success"');
  code = code.replace(/className="glass-popup-button danger"/g, 'className="btn-confirm danger"');
  code = code.replace(/className="glass-popup-button"/g, 'className="btn-cancel"');
  fs.writeFileSync(file, code);
}

replaceClasses('src/components/ui/OnboardSocietyModal.tsx');
replaceClasses('src/pages/admin/AdminPostsPage.tsx');
replaceClasses('src/components/feed/PostCreateModal.tsx');
replaceClasses('src/pages/admin/AdminAdvisorsPage.tsx');
