import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const WinModal = ({ isOpen, prize, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let intervalId = null;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const duration = 3000;
      const end = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      // Start the confetti loop
      intervalId = setInterval(function() {
        const timeLeft = end - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(intervalId);
        }
        
        // THEMED CONFETTI: Only Red and Gold
        confetti(Object.assign({}, defaults, { 
            particleCount: 20, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#DC2626', '#FCD34D', '#B91C1C'] 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount: 20, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#DC2626', '#FCD34D', '#B91C1C']
        }));
      }, 250);
    } 
    
    // CLEANUP
    return () => { 
        document.body.style.overflow = ''; 
        if (intervalId) clearInterval(intervalId); 
    };
  }, [isOpen]);

  const getIcon = (label) => {
    if (!label) return '🎉';
    const lower = label.toLowerCase();
    if (lower.includes('cash') || lower.includes('money')) return '💰';
    if (lower.includes('scholarship') || lower.includes('edu')) return '🎓';
    if (lower.includes('laptop') || lower.includes('mac')) return '💻';
    if (lower.includes('flight') || lower.includes('ticket')) return '✈️';
    if (lower.includes('goodie') || lower.includes('gift')) return '🎁';
    if (lower.includes('luggage') || lower.includes('bag')) return '🧳';
    if (lower.includes('living') || lower.includes('cost')) return '🏠';
    if (lower.includes('surprise') || lower.includes('mystery')) return '✨';
    if (lower.includes('phone') || lower.includes('mobile')) return '📱';
    return '🏆';
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP: Dark blurred overlay to make the glass pop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
            onClick={onClose}
          />

          <motion.div 
            className="relative w-full max-w-sm text-center"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            
            {/* --- FLOATING BADGE --- */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 p-1 shadow-[0_10px_25px_rgba(234,179,8,0.4)]">
                    <div className="w-full h-full rounded-full bg-red-800 flex items-center justify-center border-4 border-red-900 shadow-inner">
                        <span className="text-5xl drop-shadow-md filter select-none">{getIcon(prize?.label)}</span>
                    </div>
                </div>
            </div>

            {/* --- GLASS CARD CONTAINER --- */}
            {/* - bg-[#F9F7F2]/80: The creamy color but 80% opaque
                - backdrop-blur-xl: The heavy frosted glass effect
                - border-white/60: The icy edge
            */}
            <div className="relative bg-[#F9F7F2]/80 backdrop-blur-xl rounded-3xl p-1 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden border border-white/60 ring-1 ring-white/40">
                
                {/* GLASS SHINE (Diagonal Reflection) */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none z-10"></div>

                {/* DECORATIVE INNER BORDER */}
                <div className="absolute inset-2 border border-red-900/10 rounded-2xl z-0 pointer-events-none"></div>
                
                {/* PAPER TEXTURE (Blended softly into the glass) */}
                <div className="absolute inset-0 z-0 opacity-[0.2] pointer-events-none mix-blend-multiply" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
                </div>

                {/* Rotating Rays (Subtle Gold) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.1)_20deg,transparent_40deg,rgba(251,191,36,0.1)_60deg,transparent_80deg,rgba(251,191,36,0.1)_100deg,transparent_120deg,rgba(251,191,36,0.1)_140deg,transparent_160deg,rgba(251,191,36,0.1)_180deg,transparent_200deg,rgba(251,191,36,0.1)_220deg,transparent_240deg,rgba(251,191,36,0.1)_260deg,transparent_280deg,rgba(251,191,36,0.1)_300deg,transparent_320deg,rgba(251,191,36,0.1)_340deg,transparent_360deg)] animate-spin-slow rounded-full"></div>
                </div>

                {/* INNER CONTENT */}
                <div className="relative z-20 p-7 pt-16 rounded-3xl">
                    
                    <h2 className="text-3xl font-black tracking-tighter mb-1 font-sans text-transparent bg-clip-text bg-gradient-to-br from-red-800 to-red-600 drop-shadow-sm">
                        CONGRATULATIONS!
                    </h2>
                    
                    <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
                         <div className="h-[1px] w-8 bg-red-800"></div>
                         <p className="text-red-900 text-[10px] tracking-[0.3em] uppercase font-bold font-sans">
                            Fate has chosen
                         </p>
                         <div className="h-[1px] w-8 bg-red-800"></div>
                    </div>
                    
                    {/* Prize Box - Semi-transparent white to look like etched glass */}
                    <motion.div 
                        className="py-6 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-yellow-200/50 shadow-[0_4px_20px_rgba(251,191,36,0.15)] mb-8 relative overflow-hidden group"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Dashed gold border */}
                        <div className="absolute inset-1 border border-yellow-500/30 border-dashed rounded-lg"></div>
                        
                        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <span className="relative z-10 text-2xl md:text-3xl font-black text-gray-800 tracking-widest uppercase font-sans">
                            {prize?.label}
                        </span>
                    </motion.div>

                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold rounded-xl text-xs tracking-[0.2em] shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-t border-red-500 font-sans"
                    >
                        CLAIM REWARD
                    </button>
                    
                    <p className="mt-4 text-[9px] text-gray-500 font-sans italic">Tap anywhere to close</p>
                </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default WinModal;