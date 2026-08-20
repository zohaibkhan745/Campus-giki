const fs = require('fs');
let code = fs.readFileSync('src/components/feed/PostCard.tsx', 'utf8');

// Change the button on the back of the Image Post to match the template
const oldButton = /<button type="button" onClick=\{handleClose\} className="register-btn" style=\{\{marginTop: 'auto'\}\}>\s*<span>Close Post<\/span>\s*<\/button>/;
const newButton = `<Link to={\`/posts/\${item.id}\`} className="register-btn" style={{marginTop: 'auto'}}>
              <span>Read Full Details</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>`;

if (code.match(oldButton)) {
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('src/components/feed/PostCard.tsx', code);
}
