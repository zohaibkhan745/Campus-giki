import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-transparent">
      
      <div className="relative z-10 w-full max-w-[440px] p-10 py-10 px-7 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white flex flex-col gap-4 text-center items-center">
        <div 
          className="text-7xl font-extrabold leading-none tracking-tight"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.15)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))'
          }}
        >
          404
        </div>
        
        <h3 className="text-2xl font-bold leading-tight drop-shadow-md">
          Page Not Found
        </h3>
        
        <p className="text-[0.95rem] text-white/85 leading-relaxed drop-shadow-sm">
          The requested resource could not be located on this server. It might have been removed, renamed, or temporarily made unavailable.
        </p>
        
        <div className="flex gap-3 w-full mt-2">
          <Link 
            to="/" 
            className="flex-1 py-3 px-4 rounded-[10px] text-[0.95rem] font-semibold text-black bg-white border border-white hover:bg-white/85 hover:border-white/85 transition-all text-center inline-flex justify-center items-center"
          >
            Return Home
          </Link>
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 rounded-[10px] text-[0.95rem] font-semibold text-white/80 bg-transparent border border-white/15 backdrop-blur-[10px] hover:bg-white/10 hover:border-white/30 hover:text-white transition-all text-center inline-flex justify-center items-center cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

