const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPostsPage.tsx', 'utf8');

const oldModal = /\{\/\* Delete Confirmation Modal \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*\)\}/;

const newModal = `{/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="glass-popup-overlay z-[60]">
          <div className="glass-popup-card">
            <h3 className="glass-popup-title" style={{ color: '#fca5a5' }}>
              <AlertTriangle className="w-6 h-6" />
              <span>Remove Post</span>
            </h3>
            <p className="glass-popup-description">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPostToDelete(null)} className="glass-popup-button">
                Cancel
              </button>
              <button onClick={confirmDelete} className="glass-popup-button danger">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(oldModal, newModal);
fs.writeFileSync('src/pages/admin/AdminPostsPage.tsx', code);
