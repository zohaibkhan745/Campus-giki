const fs = require('fs');

const css = `
/* --- GLOBAL CARD TEMPLATE STYLES --- */
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

.cards-container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 32px;
  padding: 60px 20px;
}

body.is-focused .cards-container {
  z-index: 40;
}

.card-wrapper {
  position: relative;
  width: 340px;
  height: 490px;
  transform-style: preserve-3d;
  transition: height 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.15s ease-out;
  z-index: 10;
  will-change: height, transform;
}

.card-wrapper.in-focus {
  z-index: 50 !important;
  filter: none !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.card-flipper.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12);
  transform: translateZ(0);
  will-change: transform;
}

.card-corner-tag {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.post-timestamp {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 500;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8);
}

.glass-face-front {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  z-index: 2;
}

.glass-front-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
}

.glass-header-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 65px;
  flex-shrink: 0;
}

.glass-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.glass-meta-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.glass-description {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.glass-no-meta .glass-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 13;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glass-with-meta .glass-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 9;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glass-face-back {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: rotateY(180deg) translateZ(0);
  display: flex;
  flex-direction: column;
  padding: 24px;
  z-index: 1;
  position: relative;
  height: 100%;
}

.glass-back-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 14px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.glass-back-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.glass-back-scroll-area,
.event-back-scroll-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  margin-right: -2px;
}

.glass-back-scroll-area::-webkit-scrollbar,
.event-back-scroll-area::-webkit-scrollbar {
  width: 4px;
}

.glass-back-scroll-area::-webkit-scrollbar-track,
.event-back-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.glass-back-scroll-area::-webkit-scrollbar-thumb,
.event-back-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.glass-back-text {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
}

.details-btn {
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  text-align: center;
  outline: none;
  transform: translateZ(1px);
  -webkit-transform: translateZ(1px);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform, background;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  flex-shrink: 0;
}

.details-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateZ(1px) translateY(-2px);
}

.glass-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.4);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.glass-close-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.55);
  transform: scale(1.06);
}

.card-front {
  background: #14161b;
  z-index: 2;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.1) 35%,
    rgba(0, 0, 0, 0.25) 65%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  z-index: 2;
}

.user-profile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 65px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.author-name-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9);
  line-height: 1.2;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-back {
  background: #16181d;
  transform: rotateY(180deg) translateZ(0);
  display: flex;
  flex-direction: column;
  z-index: 1;
  height: 100%;
}

.back-image-section {
  position: relative;
  height: 150px;
  width: 100%;
  flex-shrink: 0;
}

.back-image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.4);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transform: translateZ(1px);
  -webkit-transform: translateZ(1px);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform, background;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  z-index: 20;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.55);
  transform: translateZ(1px) scale(1.06);
}

.back-content-section {
  padding: 20px 24px 24px;
  background: rgba(22, 24, 29, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.society-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
  flex-shrink: 0;
}

.society-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.society-text h3 {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
}

.society-text p {
  color: #94a3b8;
  font-size: 0.75rem;
}

.back-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.about-event {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
}

.about-event h4 {
  color: #cbd5e1;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.about-event p {
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.5;
}

.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: #ffffff;
  color: #0f172a;
  border: none;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
  transition: background 0.2s, transform 0.2s;
}

.register-btn:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

body.is-focused .card-wrapper:not(.in-focus) {
  filter: blur(12px);
  pointer-events: none;
}
`;

fs.appendFileSync('src/index.css', css);
