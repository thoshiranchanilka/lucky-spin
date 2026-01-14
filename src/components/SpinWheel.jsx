import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion';
import WinModal from './WinModal';

const SpinWheel = ({ prizes }) => {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const rotationRef = useRef(0);
  
  const lastResultWasTryAgain = useRef(false);

  // Responsive Size
  const [wheelSize, setWheelSize] = useState(550);

  useEffect(() => {
    const handleResize = () => {
      // Mobile: 360px, Desktop: 580px
      setWheelSize(window.innerWidth < 768 ? 360 : 580);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // --- AUDIO ---
  const tickAudio = useRef(null);
  const winAudio = useRef(null);
  const failAudio = useRef(null); 
  const startAudio = useRef(null);
  const lastSegmentRef = useRef(-1);

  useEffect(() => {
    tickAudio.current = new Audio('/tick.mp3'); 
    tickAudio.current.volume = 0.2; 

    winAudio.current = new Audio('/win.mp3');
    winAudio.current.volume = 0.8;

    failAudio.current = new Audio('/fail.mp3');
    failAudio.current.volume = 0.6;

    startAudio.current = new Audio('/spin-start.mp3');
    startAudio.current.volume = 0.6;

    return () => {
        if(tickAudio.current) { tickAudio.current.pause(); }
        if(winAudio.current) { winAudio.current.pause(); }
        if(failAudio.current) { failAudio.current.pause(); }
    };
  }, []);

  const playTick = () => {
    if (tickAudio.current) {
        tickAudio.current.currentTime = 0;
        tickAudio.current.play().catch(() => {}); 
    }
  };

  const playWin = () => {
    if (winAudio.current) {
        winAudio.current.currentTime = 0;
        winAudio.current.play().catch(() => {});
    }
  };

  const playFail = () => {
    if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play().catch(() => {});
    }
  };

  // --- 3D TILT ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  const springConfig = { stiffness: 100, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event) => {
    if (isSpinning) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getIcon = (label) => {
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
    return '😓'; 
  };

  const numSegments = prizes.length;
  const segmentAngle = 360 / numSegments;
  const radius = wheelSize / 2;
  const center = wheelSize / 2;

  // --- SPIN LOGIC ---
  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (startAudio.current) {
        startAudio.current.currentTime = 0;
        startAudio.current.play().catch(() => {});
    }

    if (winAudio.current) { winAudio.current.pause(); winAudio.current.currentTime = 0; }
    if (failAudio.current) { failAudio.current.pause(); failAudio.current.currentTime = 0; }
    
    setIsSpinning(true);
    setWinner(null);
    lastSegmentRef.current = -1; 

    const tryAgainIndices = [];
    const otherIndices = [];
    
    prizes.forEach((p, index) => {
        if (p.label.replace(/\s/g, '').toLowerCase() === 'tryagain') {
            tryAgainIndices.push(index);
        } else {
            otherIndices.push(index);
        }
    });

    let winningIndex;
    const randomChance = Math.random(); 

    if (lastResultWasTryAgain.current && otherIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherIndices.length);
        winningIndex = otherIndices[randomIndex];
        lastResultWasTryAgain.current = false; 
    } 
    else if (tryAgainIndices.length > 0 && randomChance < 0.4) {
        const randomIndex = Math.floor(Math.random() * tryAgainIndices.length);
        winningIndex = tryAgainIndices[randomIndex];
        lastResultWasTryAgain.current = true;
    } 
    else {
        const randomIndex = Math.floor(Math.random() * otherIndices.length);
        winningIndex = otherIndices[randomIndex];
        lastResultWasTryAgain.current = false;
    }
    
    const segmentCenterAngle = (winningIndex * segmentAngle) + (segmentAngle / 2);
    const targetRotationPosition = 360 - segmentCenterAngle;
    const currentRotation = rotationRef.current;
    const currentOffset = currentRotation % 360; 
    
    let distanceToTarget = targetRotationPosition - currentOffset;
    if (distanceToTarget < 0) { distanceToTarget += 360; }

    const extraSpins = 360 * 6;
    const newTotalRotation = currentRotation + extraSpins + distanceToTarget;
    rotationRef.current = newTotalRotation;

    await controls.start({
      rotate: newTotalRotation,
      transition: { duration: 4.5, ease: [0.2, 0.8, 0.2, 1] }
    });

    setIsSpinning(false);
    
    const finalPrize = prizes[winningIndex];
    setWinner(finalPrize);

    const isTryAgain = finalPrize.label.toLowerCase().includes('tryagain');
    if (isTryAgain) { playFail(); } else { playWin(); }
  };

  const handleUpdate = (latest) => {
    if (!isSpinning) return;
    const deg = latest.rotate % 360;
    const currentSegment = Math.floor(deg / segmentAngle);
    if (currentSegment !== lastSegmentRef.current) {
        lastSegmentRef.current = currentSegment;
        playTick(); 
    }
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "L", x, y, "L", start.x, start.y].join(" ");
  };

  return (
    <>
      <div 
        className="relative flex flex-col items-center justify-center py-6 md:py-20 perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] md:w-[600px] h-[380px] md:h-[600px] bg-red-500 opacity-5 blur-[60px] md:blur-[80px] rounded-full pointer-events-none z-0"></div>

        <motion.div 
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
          className="relative z-10 flex items-center justify-center"
        >
          {/* ------------------------------------------------------------
              THE "SCHOLAR'S LATTICE" BASE
              - Design: Matches the corner elements of your page.
              - Colors: Deep Red (#991B1B) + Matte Mustard (#B45309).
              - Vibe: Traditional, Educational, Structural.
              ------------------------------------------------------------
          */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] pointer-events-none">
             <div 
                className="animate-[spin_120s_linear_infinite]"
                style={{ width: wheelSize + 100, height: wheelSize + 100 }} 
             >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    <defs>
                        {/* A Geometric "Thunder Pattern" (Fretwork) for the rim */}
                        <pattern id="latticePattern" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                             <rect x="0" y="0" width="5" height="5" fill="#FF7F7F" />
                             <path d="M1,1 L4,1 L4,4 L1,4 Z" fill="none" stroke="#991B1B" strokeWidth="0.5" />
                        </pattern>
                        
                        {/* Paper Texture Filter for Matte Look */}
                        <filter id="paperFeel">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
                            <feComposite operator="in" in="noise" in2="SourceGraphic" result="textured"/>
                            <feBlend mode="multiply" in="textured" in2="SourceGraphic"/>
                        </filter>
                    </defs>
                    
                    {/* 1. OUTER RIM (The "Window Frame") */}
                    <circle cx="50" cy="50" r="49" fill="#991b1b" stroke="#b45309" strokeWidth="0.8" />
                    
                    {/* 2. LATTICE RING (The Pattern) */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#latticePattern)" strokeWidth="6" opacity="0.3" />
                    
                    {/* 3. INNER SOLID RING (Solid base for wheel) */}
                    <circle cx="50" cy="50" r="42" fill="#7f1d1d" stroke="#b45309" strokeWidth="0.5" />
                    
                    {/* 4. CARDINAL DECORATIONS (Simple circular nodes) */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={i} transform={`rotate(${angle} 50 50)`}>
                             {/* Small connecting bar */}
                             <rect x="49" y="3" width="2" height="4" fill="#b45309" />
                             {/* Round Stud (Matte Gold) */}
                             <circle cx="50" cy="3" r="1.5" fill="#fcd34d" stroke="#b45309" strokeWidth="0.3" />
                        </g>
                    ))}

                    {/* 5. Subtle Shadow for the wheel to float on */}
                    <circle cx="50" cy="50" r="38" fill="black" opacity="0.2" filter="blur(2px)" />
                </svg>
             </div>
          </div>

          {/* MAIN CLICKABLE AREA */}
          <div className="relative z-10 cursor-pointer" onClick={handleSpin}>
              
              {/* POINTER */}
              <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 z-50 transform translate-z-50 pointer-events-none filter drop-shadow-md">
                  <svg width={wheelSize < 400 ? "48" : "70"} height={wheelSize < 400 ? "56" : "80"} viewBox="0 0 64 74">
                    <path d="M32 74L10 24C10 24 0 12 0 6C0 2.7 2.7 0 6 0H58C61.3 0 64 2.7 64 6C64 12 54 24 54 24L32 74Z" 
                          fill="url(#goldPointer)" 
                          stroke="white" 
                          strokeWidth="3"
                    />
                    <circle cx="32" cy="18" r="8" fill="#B91C1C" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
                    <defs>
                      <linearGradient id="goldPointer" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FCD34D" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </svg>
              </div>

              {/* BEZEL */}
              <div className="absolute inset-[-16px] md:inset-[-24px] rounded-full bg-white shadow-xl pointer-events-none translate-z-[-10px]"></div>
              <div className="absolute inset-[-8px] md:inset-[-12px] rounded-full border-2 border-red-100 bg-gray-50 pointer-events-none z-0"></div>
              <div className="absolute inset-[-4px] rounded-full border-2 border-red-500/20 pointer-events-none z-20"></div>

              {/* WHEEL */}
              <motion.div 
                className="relative rounded-full overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] border-4 border-white"
                style={{ width: wheelSize, height: wheelSize }}
                animate={controls}
                initial={{ rotate: 0 }}
                onUpdate={handleUpdate} 
              >
                <svg viewBox={`0 0 ${wheelSize} ${wheelSize}`} className="w-full h-full transform scale-105 pointer-events-none">
                  <defs>
                    <linearGradient id="segmentWhite" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F3F4F6" />
                    </linearGradient>
                    <linearGradient id="segmentRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                  </defs>

                  <circle cx={center} cy={center} r={radius} fill="#fff" />

                  {prizes.map((prize, index) => {
                    const startAngle = index * segmentAngle;
                    const endAngle = (index + 1) * segmentAngle;
                    const midAngle = startAngle + (segmentAngle / 2);
                    const textPos = polarToCartesian(center, center, radius * 0.72, midAngle);
                    const isRed = index % 2 === 0;
                    const icon = getIcon(prize.label);

                    return (
                      <g key={index}>
                        <path 
                          d={describeArc(center, center, radius, startAngle, endAngle)} 
                          fill={isRed ? "url(#segmentRed)" : "url(#segmentWhite)"}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <g transform={`translate(${textPos.x}, ${textPos.y}) rotate(${midAngle + 90})`}>
                            <text 
                              x="0" y="0" 
                              textAnchor="middle" 
                              dominantBaseline="middle" 
                              fontFamily="'Lato', sans-serif" 
                              fontWeight="700"
                            >
                              <tspan 
                                x="0" 
                                dy="-12" 
                                fontSize={wheelSize < 400 ? "18" : "24"}
                                style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" }}
                                >
                                    {icon}
                              </tspan>
                              <tspan 
                                x="0" 
                                dy={wheelSize < 400 ? "20" : "26"} 
                                fontSize={wheelSize < 400 ? "9" : "11"} 
                                fontWeight="900" 
                                fill={isRed ? "#FFFFFF" : "#B91C1C"}
                                className="uppercase tracking-[0.1em]"
                                style={{ filter: isRed ? "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" : "none" }}
                              >
                                    {prize.label}
                              </tspan>
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
                
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.15)] pointer-events-none"></div>
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>

              {/* BUTTON */}
              <button 
                onClick={(e) => {
                    e.stopPropagation(); 
                    handleSpin();
                }}
                disabled={isSpinning}
                className={`
                  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] 
                  w-16 h-16 md:w-24 md:h-24 rounded-full 
                  border-4 border-white
                  flex flex-col items-center justify-center
                  shadow-lg
                  cursor-pointer transition-transform
                  bg-gradient-to-br from-[#EF4444] to-[#B91C1C]
                  hover:scale-105 active:scale-95
                  ${isSpinning ? 'opacity-90 scale-95 cursor-wait' : ''}
                `}
              >
                <div className="absolute inset-0 rounded-full border border-white/20"></div>
                <span className="text-white/80 text-[7px] md:text-[9px] tracking-[0.2em] mb-0.5 font-bold font-sans">
                    {isSpinning ? "WAIT" : "TAP"}
                </span>
                <span className="text-white font-black text-sm md:text-xl tracking-widest drop-shadow-sm font-sans">
                    SPIN
                </span>
              </button>
          </div>

        </motion.div>
        
        {/* Floor Shadow */}
        <div className="absolute -bottom-10 md:-bottom-20 w-[300px] md:w-[450px] h-[20px] md:h-[30px] bg-black/5 blur-xl transform perspective-[500px] rotateX(60deg) pointer-events-none"></div>
      </div>

      <WinModal 
        isOpen={!!winner} 
        prize={winner} 
        onClose={() => setWinner(null)} 
      />
    </>
  );
};

export default SpinWheel;