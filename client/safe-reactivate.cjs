const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSocietiesPage.tsx', 'utf8');

// 1. Add reactivatingSociety state
code = code.replace(/const \[deactivatingSociety, setDeactivatingSociety\] = useState<AdminSocietyItem \| null>\(null\);/, 
'const [deactivatingSociety, setDeactivatingSociety] = useState<AdminSocietyItem | null>(null);\n  const [reactivatingSociety, setReactivatingSociety] = useState<AdminSocietyItem | null>(null);');

// 2. The Reactivate button
// Use strict string replace
const oldBtn = `<button
                                onClick={() => reactivateMutation.mutate(society.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 bg-transparent text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                title="Reactivate Society"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Reactivate
                              </button>`;
const newBtn = `<button
                                onClick={(e) => { e.stopPropagation(); setReactivatingSociety(society); }}
                                className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold transition-all flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                                title="Reactivate Society"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Reactivate
                              </button>`;

code = code.replace(oldBtn, newBtn);


// 3. The Modals
const oldModalsRegex = /\{\/\* 3\. Deactivate Confirmation Dialog \*\/\}([\s\S]*)$/;

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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="glass-popup-button"
                onClick={() => setDeactivatingSociety(null)}
                style={{width:"auto"}}
              >
                Cancel
              </button>
              <button
                type="button"
                className="glass-popup-button danger"
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(deactivatingSociety.id)}
                style={{width:"auto"}}
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="glass-popup-button"
                onClick={() => setReactivatingSociety(null)}
                style={{width:"auto"}}
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
                style={{width:"auto"}}
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

code = code.replace(oldModalsRegex, newModals);

fs.writeFileSync('src/pages/admin/AdminSocietiesPage.tsx', code);
