const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace old dropdown styles with exactly the user's provided CSS
const dropdownRegex = /\/\* --- GLASSMORPHIC DROPDOWN TEMPLATE STYLES ---\*\/[\s\S]*?\/\* --- END GLASSMORPHIC DROPDOWN ---\*\//;
const newDropdownCSS = `/* --- EXACT DROPDOWN TEMPLATE STYLES --- */
.dropdown-container {
  position: relative;
  width: 100%;
  z-index: 50; /* ensure it pops over adjacent items */
}

.dropdown-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  outline: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
}

.btn-left-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.country-code {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 600;
  min-width: 22px;
}

.language-name {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  stroke: #ffffff;
  stroke-width: 2;
  fill: none;
  transition: transform 0.25s ease;
}

.dropdown-container.open .arrow-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: rgba(20, 20, 24, 0.65);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  display: none;
  z-index: 1000;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  padding: 6px 4px 6px 6px;
}

.dropdown-container.open .dropdown-menu {
  display: block;
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-item.active {
  background-color: rgba(59, 130, 246, 0.15);
}

.dropdown-item.active .country-code,
.dropdown-item.active .language-name {
  color: #60a5fa;
  font-weight: 600;
}

.check-icon {
  width: 16px;
  height: 16px;
  stroke: #60a5fa;
  stroke-width: 2.5;
  fill: none;
  display: none;
}

.dropdown-item.active .check-icon {
  display: block;
}

.dropdown-list::-webkit-scrollbar {
  width: 5px;
}

.dropdown-list::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.dropdown-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
/* --- END EXACT DROPDOWN STYLES --- */`;

if (css.match(dropdownRegex)) {
  css = css.replace(dropdownRegex, newDropdownCSS);
} else {
  // If not found by regex, append it
  css += '\\n' + newDropdownCSS;
}

const modalRegex = /\/\* --- GLASSMORPHIC POPUP THEME ---\*\/[\s\S]*?(?=\/\*|$)/;
const newModalCSS = `/* --- EXACT MODAL THEME --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s cubic-bezier(0.2, 0, 0, 1),
              backdrop-filter 0.25s cubic-bezier(0.2, 0, 0, 1),
              -webkit-backdrop-filter 0.25s cubic-bezier(0.2, 0, 0, 1);
  will-change: opacity, backdrop-filter;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
}

.modal-box {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
  opacity: 0;
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1),
              opacity 0.25s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform, opacity;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-overlay.active .modal-box {
  transform: scale(1);
  opacity: 1;
}

.modal-title {
  color: #ffffff;
  font-size: 19px;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 1.5;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-confirm {
  background: rgba(59, 130, 246, 0.75);
  border: 1px solid rgba(147, 197, 253, 0.6);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-confirm:hover {
  background: rgba(59, 130, 246, 0.95);
  border-color: rgba(191, 219, 254, 0.9);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
}

.btn-confirm.danger {
  background: rgba(239, 68, 68, 0.75);
  border: 1px solid rgba(248, 113, 113, 0.6);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.btn-confirm.danger:hover {
  background: rgba(239, 68, 68, 0.95);
  border-color: rgba(248, 113, 113, 0.9);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.btn-confirm.success {
  background: rgba(16, 185, 129, 0.75);
  border: 1px solid rgba(52, 211, 153, 0.6);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-confirm.success:hover {
  background: rgba(16, 185, 129, 0.95);
  border-color: rgba(52, 211, 153, 0.9);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
}
/* --- END EXACT MODAL THEME --- */`;

if (css.match(modalRegex)) {
  css = css.replace(modalRegex, newModalCSS);
} else {
  css += '\\n' + newModalCSS;
}

fs.writeFileSync('src/index.css', css);
