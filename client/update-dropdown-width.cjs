const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(
  /\.dropdown-container \{\s*position: relative;\s*width: 100%;\s*z-index: 50;\s*\}/,
  `.dropdown-container {\n  position: relative;\n  width: max-content;\n  min-width: 100%;\n  z-index: 50;\n}`
);

css = css.replace(
  /\.dropdown-menu \{\s*position: absolute;\s*top: calc\(100% \+ 8px\);\s*left: 0;\s*width: 100%;/,
  `.dropdown-menu {\n  position: absolute;\n  top: calc(100% + 8px);\n  left: 0;\n  width: max-content;\n  min-width: 100%;`
);

fs.writeFileSync('src/index.css', css);
