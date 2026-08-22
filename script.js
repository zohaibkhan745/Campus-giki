const fs = require('fs');
let code = fs.readFileSync('client/src/components/navigation/DockNav.tsx', 'utf8');
const startIdx = code.indexOf('const animate = () => {');
const endMarker = 'animationFrameId.current = requestAnimationFrame(animate);';
const endIdx = code.indexOf('}', code.indexOf(endMarker)) + 1;

let replacement = '    const animate = () => {\\n' +
'      let isSettled = true;\\n\\n' +
'      const rects = placeholders.map(ph => ph.getBoundingClientRect());\\n\\n' +
'      placeholders.forEach((ph, index) => {\\n' +
'        const item = items[index];\\n' +
'        if (!item) return;\\n' +
'        const isActive = item.classList.contains(\\'active\\');\\n' +
'        let targetSize = baseSize; let targetMargin = baseMargin; let targetY = 0; let targetOpacity = 1; let targetScale = 1;\\n' +
'        if (isCollapsed.current && !isActive) { targetSize = 0; targetMargin = 0; targetOpacity = 0; targetScale = 0.3; }\\n' +
'        else if (isHovering.current && mouseX.current !== null && !isCollapsed.current) {\\n' +
'            const rect = rects[index];\\n' +
'            const itemCenterX = rect.left + rect.width / 2;\\n' +
'            const distance = Math.abs(mouseX.current - itemCenterX);\\n' +
'            if (distance < distanceThreshold) {\\n' +
'                const progress = Math.cos((distance / distanceThreshold) * (Math.PI / 2));\\n' +
'                targetSize = baseSize + (maxSize - baseSize) * progress;\\n' +
'                targetMargin = baseMargin + (maxMargin - baseMargin) * progress;\\n' +
'                targetY = (targetSize - baseSize) * 0.4;\\n' +
'            }\\n' +
'        }\\n' +
'        const state = itemStates.current[index];\\n' +
'        const easeSpeed = 0.28;\\n' +
'        state.size = lerp(state.size, targetSize, easeSpeed);\\n' +
'        state.margin = lerp(state.margin, targetMargin, easeSpeed);\\n' +
'        state.y = lerp(state.y, targetY, easeSpeed);\\n' +
'        state.scale = lerp(state.scale, targetScale, easeSpeed);\\n' +
'        state.opacity = lerp(state.opacity, targetOpacity, easeSpeed);\\n' +
'        if (Math.abs(state.size - targetSize) > 0.05 || Math.abs(state.margin - targetMargin) > 0.05 || Math.abs(state.y - targetY) > 0.05 || Math.abs(state.opacity - targetOpacity) > 0.01) { isSettled = false; }\\n' +
'        ph.style.width = state.size + \\'px\\';\\n' +
'        ph.style.height = state.size + \\'px\\';\\n' +
'        ph.style.margin = \\'0 \\' + state.margin + \\'px\\';\\n' +
'      });\\n\\n' +
'      const newRects = placeholders.map(ph => ph.getBoundingClientRect());\\n' +
'      placeholders.forEach((ph, index) => {\\n' +
'        const item = items[index];\\n' +
'        if (!item) return;\\n' +
'        const state = itemStates.current[index];\\n' +
'        const phRect = newRects[index];\\n' +
'        item.style.width = state.size + \\'px\\';\\n' +
'        item.style.height = state.size + \\'px\\';\\n' +
'        item.style.left = phRect.left + \\'px\\';\\n' +
'        item.style.top = phRect.top + \\'px\\';\\n' +
'        const inner = item.querySelector(\\'#nav-item-inner-id-should-be-class\\');\\n' + // wait, I don't need inner since it's child. Wait, inner was used previously?
'        item.style.transform = \\'translateY(-\\' + state.y + \\'px) scale(\\' + state.scale + \\')\\';\\n' +
'        item.style.opacity = state.opacity.toString();\\n' +
'        item.style.pointerEvents = state.opacity < 0.2 ? \\'none\\' : \\'auto\\';\\n' +
'      });\\n\\n' +
'      if (!isSettled) { animationFrameId.current = requestAnimationFrame(animate); }\\n' +
'      else { animationFrameId.current = null; }\\n' +
'    }';
code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('client/src/components/navigation/DockNav.tsx', code, 'utf8');
