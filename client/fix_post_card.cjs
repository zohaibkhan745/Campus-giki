const fs = require('fs');
let code = fs.readFileSync('src/components/feed/PostCard.tsx', 'utf8');

code = code.replace(
  /return \(\s*<>\s*<style>\{.*?<\/style>/s,
  `return (
    <>
      <style>{\`
        .post-card-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
          perspective: 1200px;
          z-index: 1;
        }

        .post-card-wrapper.is-active {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          z-index: 50;
          width: 360px;
          height: 520px;
        }

        .post-card-flipper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
        }

        .post-card-flipper.flipped {
          transform: rotateY(180deg);
        }

        .post-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .post-card-front {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          flex-direction: column;
        }

        .post-card-back {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        \`}</style>
        
        {isFlipped && (
          <div 
            className="fixed inset-0 bg-[#050507]/60 backdrop-blur-md z-40"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          />
        )}
  `
);

fs.writeFileSync('src/components/feed/PostCard.tsx', code);
