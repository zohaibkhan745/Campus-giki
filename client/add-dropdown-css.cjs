const fs = require('fs');

const css = `
/* --- GLASSMORPHIC DROPDOWN TEMPLATE STYLES --- */
.glass-dropdown-container {
  position: relative;
  width: 100%;
  z-index: 1;
}

.glass-dropdown-btn {
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

.glass-dropdown-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
}

.glass-dropdown-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-dropdown-btn-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.glass-dropdown-code {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 600;
  min-width: 22px;
}

.glass-dropdown-label {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.glass-dropdown-arrow {
  width: 16px;
  height: 16px;
  stroke: #ffffff;
  stroke-width: 2;
  fill: none;
  transition: transform 0.25s ease;
}

.glass-dropdown-container.open .glass-dropdown-arrow {
  transform: rotate(180deg);
}

.glass-dropdown-menu {
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

.glass-dropdown-container.open .glass-dropdown-menu {
  display: block;
}

.glass-dropdown-list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.glass-dropdown-item {
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

.glass-dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.glass-dropdown-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.glass-dropdown-item.active {
  background-color: rgba(59, 130, 246, 0.15);
}

.glass-dropdown-item.active .glass-dropdown-code,
.glass-dropdown-item.active .glass-dropdown-label {
  color: #60a5fa;
  font-weight: 600;
}

.glass-dropdown-check {
  width: 16px;
  height: 16px;
  stroke: #60a5fa;
  stroke-width: 2.5;
  fill: none;
  display: none;
}

.glass-dropdown-item.active .glass-dropdown-check {
  display: block;
}

.glass-dropdown-list::-webkit-scrollbar {
  width: 5px;
}

.glass-dropdown-list::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.glass-dropdown-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.glass-dropdown-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
}

.glass-dropdown-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
`;

fs.appendFileSync('src/index.css', css);
