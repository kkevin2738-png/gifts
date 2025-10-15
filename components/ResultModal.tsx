import React, { useEffect, useMemo } from 'react';

interface PrizeTier {
    id: number;
    count: number;
    name?: string;
    color: {
        list: string;
        winner: string;
        modal: string;
    };
}

interface ResultModalProps {
    numbers: number[];
    onClose: () => void;
    prizeTiers: PrizeTier[];
    drawnTierId: number;
}

const Confetti: React.FC = () => {
    const confettiPieces = useMemo(() => {
        const pieces = [];
        const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b'];
        for (let i = 0; i < 15; i++) {
            const style = {
                left: `${Math.random() * 100}%`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
            };
            pieces.push(<div key={i} className="confetti-piece" style={style}></div>);
        }
        return pieces;
    }, []);

    return <div className="confetti">{confettiPieces}</div>;
};


const ResultModal: React.FC<ResultModalProps> = ({ numbers, onClose, prizeTiers, drawnTierId }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds to enjoy confetti

        return () => clearTimeout(timer);
    }, [onClose]);
    
    const drawnTier = useMemo(() => prizeTiers.find(t => t.id === drawnTierId), [prizeTiers, drawnTierId]);
    const tierColorClass = drawnTier?.color.modal || 'bg-teal-400 text-white';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full transform transition-all animate-in fade-in-0 zoom-in-90 duration-300 overflow-hidden border border-white/60">
                <Confetti />
                <h2 className="text-3xl sm:text-4xl text-center font-black text-pink-500 mb-6 z-10 relative">🎉 축하합니다! 🎉</h2>
                <div className="flex flex-wrap items-center justify-center gap-4 z-10 relative">
                    {numbers.map((num) => (
                        <div key={num} className={`font-black text-5xl sm:text-7xl w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-2xl shadow-lg ${tierColorClass}`}>
                            {num}
                        </div>
                    ))}
                </div>
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
        </div>
    );
};

export default ResultModal;