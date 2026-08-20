const fs = require('fs');

const css = `
/* --- GLASSMORPHIC POPUP THEME --- */
.glass-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4); /* subtle dark overlay */
  padding: 20px;
}

.glass-popup-card {
  position: relative;
  z-index: 1001;
  width: 100%;
  padding: 32px 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.glass-popup-title {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

.glass-popup-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.glass-popup-button {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.glass-popup-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.glass-popup-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-popup-button.danger {
  background: rgba(239, 68, 68, 0.2); /* red-500/20 */
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5; /* red-300 */
}

.glass-popup-button.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.35);
  border-color: rgba(239, 68, 68, 0.6);
  color: #ffffff;
}

.glass-popup-button.success {
  background: rgba(16, 185, 129, 0.2); /* emerald-500/20 */
  border-color: rgba(16, 185, 129, 0.4);
  color: #6ee7b7; /* emerald-300 */
}

.glass-popup-button.success:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.35);
  border-color: rgba(16, 185, 129, 0.6);
  color: #ffffff;
}
`;

fs.appendFileSync('src/index.css', css);
