const fs = require('fs');
const css = `
/* --- GLOBAL FOCUS BACKDROP & BLUR LOGIC --- */
.focus-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 30;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.focus-backdrop.active {
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
}

body.is-focused .focus-backdrop {
  opacity: 1;
  pointer-events: auto;
}

body.is-focused .card-wrapper:not(.in-focus) {
  filter: blur(12px);
  pointer-events: none;
}

/* Ensure parents of in-focus cards can pop above the backdrop */
body.is-focused .has-focused-card {
  z-index: 40 !important;
  position: relative;
}

body.is-focused aside, 
body.is-focused header, 
body.is-focused nav {
  filter: blur(12px);
  pointer-events: none;
  transition: filter 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
`;
fs.appendFileSync('src/index.css', css);
