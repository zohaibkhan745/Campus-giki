const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// Replace Reactivate button styles in the table
const oldReactivateBtn = /<button[\s\S]*?reactivateMutation\.mutate\(society\.id\)[\s\S]*?className="px-2\.5 py-1 rounded-lg text-\[11px\] font-bold transition-all flex items-center gap-1 bg-transparent text-emerald-400 border border-emerald-500\/30 hover:bg-emerald-500\/20"[\s\S]*?>[\s\S]*?<CheckCircle2 className="w-3 h-3" \/>[\s\S]*?Reactivate[\s\S]*?<\/button>/;

const newReactivateBtn = `<button
                                onClick={() => setReactivatingSociety(society)}
                                className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold transition-all flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                                title="Reactivate Society"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Reactivate
                              </button>`;

code = code.replace(oldReactivateBtn, newReactivateBtn);

// Replace popup classes
code = code.replace(/glass-popup-overlay/g, 'modal-overlay active');
code = code.replace(/glass-popup-card/g, 'modal-box');
code = code.replace(/glass-popup-title/g, 'modal-title');
code = code.replace(/glass-popup-description/g, 'modal-description');
code = code.replace(/<div className="flex justify-end gap-3 pt-2">/g, '<div className="modal-actions">');
code = code.replace(/className="glass-popup-button success"/g, 'className="btn-confirm success"');
code = code.replace(/className="glass-popup-button danger"/g, 'className="btn-confirm danger"');
code = code.replace(/className="glass-popup-button"/g, 'className="btn-cancel"');

// Ensure OnboardSocietyModal is added at the end if missing
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

// Add import if missing
if (!code.includes('OnboardSocietyModal')) {
  code = code.replace(/import \{ AdminSocietyItem \} from '@\/types\/society\.types';/, `import { AdminSocietyItem } from '@/types/society.types';\nimport { OnboardSocietyModal } from '@/components/ui/OnboardSocietyModal';`);
}

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
