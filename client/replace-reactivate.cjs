const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// Add reactivatingSociety state
code = code.replace(/const \[deactivatingSociety, setDeactivatingSociety\] = useState<AdminSocietyItem \| null>\(null\);/, 
'const [deactivatingSociety, setDeactivatingSociety] = useState<AdminSocietyItem | null>(null);\n  const [reactivatingSociety, setReactivatingSociety] = useState<AdminSocietyItem | null>(null);');

// The Reactivate button
const oldReactivateBtn = /<button[\s\S]*?reactivateMutation\.mutate\(society\.id\)[\s\S]*?Reactivate\s*<\/button>/m;
const newReactivateBtn = `<button
                                onClick={(e) => { e.stopPropagation(); setReactivatingSociety(society); }}
                                className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold transition-all flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                                title="Reactivate Society"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Reactivate
                              </button>`;

code = code.replace(oldReactivateBtn, newReactivateBtn);


// The Modals
const oldModalsRegex = /\{\/\* 3\. Deactivate Confirmation Dialog \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\s*;/;

// Reconstruct Modals
const newModals = `{/* 3. Deactivate Confirmation Dialog */}
      {deactivatingSociety && (
        <div className="glass-popup-overlay">
          <div className="glass-popup-card">
            <h3 className="glass-popup-title" style={{ color: '#fca5a5' }}>
              <Ban className="w-5 h-5" />
              <span>Deactivate Society Account?</span>
            </h3>

            <p className="glass-popup-description">
              Are you sure you want to deactivate <strong style={{color: '#ffffff'}}>{deactivatingSociety.name}</strong>?
              This will suspend login access for the society president. Historical events and yearly plans will remain intact.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="glass-popup-button"
                onClick={() => setDeactivatingSociety(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="glass-popup-button danger"
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(deactivatingSociety.id)}
              >
                {deactivateMutation.isPending ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reactivate Confirmation Dialog */}
      {reactivatingSociety && (
        <div className="glass-popup-overlay">
          <div className="glass-popup-card">
            <h3 className="glass-popup-title" style={{ color: '#6ee7b7' }}>
              <CheckCircle2 className="w-5 h-5" />
              <span>Reactivate Society Account?</span>
            </h3>

            <p className="glass-popup-description">
              Are you sure you want to reactivate <strong style={{color: '#ffffff'}}>{reactivatingSociety.name}</strong>?
              This will restore login access and all privileges for the society president.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="glass-popup-button"
                onClick={() => setReactivatingSociety(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="glass-popup-button success"
                disabled={reactivateMutation.isPending}
                onClick={() => {
                  reactivateMutation.mutate(reactivatingSociety.id);
                  setReactivatingSociety(null);
                }}
              >
                {reactivateMutation.isPending ? 'Processing...' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

// Wait, the regex might not capture the end correctly. Let's just do a simpler replace.
code = code.replace(/\{\/\* 3\. Deactivate Confirmation Dialog \*\/\}([\s\S]*)$/, newModals);

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
