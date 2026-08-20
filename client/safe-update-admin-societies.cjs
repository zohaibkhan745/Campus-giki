const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// Safely update Reactivate button classes
code = code.replace(/bg-transparent text-emerald-400 border border-emerald-500\/30 hover:bg-emerald-500\/20/g, 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md');
code = code.replace(/onClick=\{\(\) => reactivateMutation\.mutate\(society\.id\)\}/g, 'onClick={() => setReactivatingSociety(society)}');
code = code.replace(/<CheckCircle2 className="w-3 h-3" \/>/g, '<CheckCircle2 className="w-3.5 h-3.5" />');

// Update modal classes
code = code.replace(/glass-popup-overlay/g, 'modal-overlay active');
code = code.replace(/glass-popup-card/g, 'modal-box');
code = code.replace(/glass-popup-title/g, 'modal-title');
code = code.replace(/glass-popup-description/g, 'modal-description');
code = code.replace(/<div className="flex justify-end gap-3 pt-2">/g, '<div className="modal-actions">');
code = code.replace(/className="glass-popup-button success"/g, 'className="btn-confirm success"');
code = code.replace(/className="glass-popup-button danger"/g, 'className="btn-confirm danger"');
code = code.replace(/className="glass-popup-button"/g, 'className="btn-cancel"');

// Make sure OnboardSocietyModal is added
if (!code.includes('<OnboardSocietyModal')) {
  code = code.replace(/<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\s*;/g, `</div>
        </div>
      )}
      
      <OnboardSocietyModal
        isOpen={isAddSocietyModalOpen}
        onClose={() => setIsAddSocietyModalOpen(false)}
        onSuccess={() => {
          setIsAddSocietyModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
          showNotification('reactivate', 'Society successfully onboarded.');
        }}
      />
    </div>
  );
};`);
}

// Ensure the import exists
if (!code.includes('OnboardSocietyModal')) {
  code = code.replace(/import \{ AdminSocietyItem \} from '@\/types\/society\.types';/, `import { AdminSocietyItem } from '@/types/society.types';\nimport { OnboardSocietyModal } from '@/components/ui/OnboardSocietyModal';`);
}

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
