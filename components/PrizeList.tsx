import React, { useState, useEffect } from 'react';

interface PrizeTier {
    id: number;
    name?: string;
    count: number;
    color: {
        list: string;
        winner: string;
        modal: string;
    };
}

interface Prize {
    id: number;
    name: string;
    count: number;
}

interface PrizeListProps {
    prizeTiers: PrizeTier[];
    prizes: Prize[];
    onPrizesChange: (newPrizes: Prize[]) => void;
}

const PrizeList: React.FC<PrizeListProps> = ({ prizeTiers, prizes, onPrizesChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPrizes, setEditedPrizes] = useState(prizes);

    useEffect(() => {
        setEditedPrizes(prizes);
    }, [prizes]);

    const handleEditToggle = () => {
        if (isEditing) {
            onPrizesChange(editedPrizes);
        }
        setIsEditing(!isEditing);
    };
    
    const handlePrizeChange = (id: number, field: 'name' | 'count', value: string | number) => {
        setEditedPrizes(currentPrizes => 
            currentPrizes.map(p => p.id === id ? { ...p, [field]: value } : p)
        );
    };

    return (
        <div className="w-full max-w-md p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60">
            <div className="relative flex justify-center items-center mb-4">
                <div className="flex items-center gap-1 -translate-x-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800">경품 리스트</h2>
                </div>
                <button 
                    onClick={handleEditToggle}
                    className="absolute right-0 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    {isEditing ? '저장' : '수정'}
                </button>
            </div>
            <ul className="space-y-3">
                {prizeTiers.map((tier, index) => {
                    const prize = isEditing 
                        ? editedPrizes.find(p => p.id === tier.id) 
                        : prizes.find(p => p.id === tier.id);
                        
                    if (!prize) return null;
                    
                    return (
                        <li key={prize.id} className="flex items-center gap-4 p-2 rounded-lg bg-gray-100/60">
                            <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${tier.color.list}`}>
                                {index + 1}
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input 
                                        type="text"
                                        value={prize.name}
                                        onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)}
                                        placeholder={`경품 ${tier.id}`}
                                        className="w-full bg-white/50 text-base font-medium text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    />
                                    <input
                                        type="number"
                                        value={prize.count}
                                        onChange={(e) => handlePrizeChange(prize.id, 'count', parseInt(e.target.value, 10) || 0)}
                                        className="w-20 bg-white/50 text-xl font-medium text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
                                        min="0"
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="text-xl font-bold text-gray-800">
                                        {prize.name || `경품 ${tier.id}`}
                                    </span>
                                    <div className="ml-auto flex items-center gap-3">
                                        <div className="border-l border-gray-300 h-6"></div>
                                        <span className="w-16 text-center text-xl font-bold text-gray-800">
                                            {prize.count}개
                                        </span>
                                    </div>
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default PrizeList;