import React from 'react';

interface RaffleBoxProps {
    isDrawing: boolean;
}

const RaffleBox: React.FC<RaffleBoxProps> = ({ isDrawing }) => {
    return (
        <div className="relative w-full max-w-lg h-64 md:h-72 flex flex-col items-center justify-center p-4 -mt-12">
            {/* The Raffle Bear Character */}
            <div className={`w-full h-full flex items-center justify-center ${isDrawing ? 'animate-shake' : 'animate-bounce-slow'}`}>
                <svg viewBox="0 0 200 180" className="w-full h-full" aria-label="선물 상자를 들고 있는 귀여운 곰 캐릭터">
                    <g transform="translate(100, 90)">
                        {/* Body */}
                        <path d="M -60,60 C -60,20 60,20 60,60 C 60,100 -60,100 -60,60 Z" fill="#D2B48C"/>

                        {/* Head */}
                        <g transform="translate(0, 10)">
                            {/* Ears */}
                            <circle cx="-45" cy="-40" r="15" fill="#A0522D"/>
                            <circle cx="45" cy="-40" r="15" fill="#A0522D"/>
                            <circle cx="-45" cy="-40" r="10" fill="#D2B48C"/>
                            <circle cx="45" cy="-40" r="10" fill="#D2B48C"/>

                            {/* Head shape */}
                            <circle cx="0" cy="-20" r="50" fill="#D2B48C"/>
                            
                            {/* Snout */}
                            <ellipse cx="0" cy="5" rx="25" ry="22" fill="#F5DEB3"/>
                            
                            {/* Cheeks */}
                            <circle cx="-30" cy="8" r="10" fill="#FFB6C1" opacity="0.8"/>
                             <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M-33,7 L-31,7"/>
                                <path d="M-32,10 L-30,10"/>
                                <path d="M-29,7 L-27,7"/>
                            </g>
                            <circle cx="30" cy="8" r="10" fill="#FFB6C1" opacity="0.8"/>
                            <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M27,7 L29,7"/>
                                <path d="M30,10 L32,10"/>
                                <path d="M31,7 L33,7"/>
                            </g>
                            
                            {/* Eyes */}
                            <circle cx="-18" cy="-15" r="4" fill="#4A3731"/>
                            <circle cx="18" cy="-15" r="4" fill="#4A3731"/>
                            
                            {/* Nose */}
                            <path d="M-4,2 Q0,-2 4,2 Q0,6 -4,2 Z" fill="#4A3731" />

                            {/* Mouth */}
                            <path d="M-7,7 C-3 12, 3 12, 7 7" stroke="#4A3731" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </g>

                        {/* Box */}
                        <g transform="translate(0, 45)">
                            {/* Box Body */}
                            <rect x="-40" y="0" width="80" height="50" rx="5" fill="#4682B4"/>
                            {/* Ribbon */}
                            <rect x="-5" y="0" width="10" height="50" fill="#B0C4DE"/>
                            <path d="M -10, -5 C -20 -20, 0 -15, 0 -2 Z" fill="#B0C4DE"/>
                            <path d="M 10, -5 C 20 -20, 0 -15, 0 -2 Z" fill="#B0C4DE"/>
                             {/* Slot */}
                            <rect x="-15" y="-2" width="30" height="4" rx="2" fill="#2F4F4F"/>
                        </g>

                        {/* Arms */}
                        <path d="M -55,50 C -75,55 -70,85 -50,85 L -42,85 C -32,85 -37,55 -42,50 Z" fill="#D2B48C" stroke="#A0522D" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M 55,50 C 75,55 70,85 50,85 L 42,85 C 32,85 37,55 42,50 Z" fill="#D2B48C" stroke="#A0522D" strokeWidth="2" strokeLinejoin="round"/>

                    </g>
                </svg>
            </div>
            
            {/* Flying Ticket (position adjusted) */}
            <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 w-16 ${isDrawing ? 'animate-fly-out' : 'hidden'}`}>
                <svg viewBox="0 0 50 70">
                    <g>
                        <path d="M0 5 Q0 0 5 0 L 45 0 Q50 0 50 5 L 50 65 Q50 70 45 70 L 5 70 Q0 70 0 65 Z" fill="#e5e7eb" stroke="#312e81" strokeWidth="2"/>
                        <circle cx="25" cy="25" r="15" fill="#fff" stroke="#312e81" strokeWidth="1.5" />
                        <text x="25" y="32" fontSize="20" fontWeight="bold" fill="#312e81" textAnchor="middle">?</text>
                        <path d="M0 50 L 50 50" stroke="#312e81" strokeWidth="1.5" strokeDasharray="4 2" />
                    </g>
                </svg>
            </div>

            {isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/30 rounded-2xl">
                    <div className="text-5xl font-black text-white bg-black/50 px-4 py-2 rounded-lg animate-pulse">
                        ✨추첨 중✨
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaffleBox;