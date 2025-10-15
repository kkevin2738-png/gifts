import React, { useMemo } from 'react';

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

interface DrawControlsProps {
    onDraw: (count: number) => void;
    onReset: () => void;
    isDrawing: boolean;
    remainingCount: number;
    winnerCount: number;
    totalPrizes: number;
    prizeTiers: PrizeTier[];
    prizes: { id: number; name: string }[];
    winners: (number | undefined)[];
    selectedTierId: number | null;
    onSelectedTierIdChange: (id: number | null) => void;
}

const DrawButton: React.FC<{
    count: number;
    onDraw: (count: number) => void;
    isDisabled: boolean;
    colorClass: string;
}> = ({ count, onDraw, isDisabled, colorClass }) => {
    return (
        <button
            onClick={() => onDraw(count)}
            disabled={isDisabled}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-lg whitespace-nowrap focus:outline-none focus:ring-4 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none ${colorClass}`}
        >
            {count}개 뽑기
        </button>
    );
};

const DrawControls: React.FC<DrawControlsProps> = ({ 
    onDraw, 
    onReset, 
    isDrawing, 
    remainingCount, 
    winnerCount, 
    totalPrizes,
    prizeTiers,
    prizes,
    winners,
    selectedTierId,
    onSelectedTierIdChange
}) => {
    const drawCounts = [1, 2, 3, 4, 5, 10];
    const remainingPrizes = totalPrizes - winnerCount;

    const remainingSlotsByTier = useMemo(() => {
        const slots: { [key: number]: number } = {};
        let cumulativeCount = 0;
        prizeTiers.forEach(tier => {
            const tierWinners = winners.slice(cumulativeCount, cumulativeCount + tier.count);
            const slotsTaken = tierWinners.filter(w => w !== undefined).length;
            slots[tier.id] = tier.count - slotsTaken;
            cumulativeCount += tier.count;
        });
        return slots;
    }, [winners, prizeTiers]);

    const remainingForSelectedTier = selectedTierId ? remainingSlotsByTier[selectedTierId] : 0;
    
    const getButtonColorClass = (tierId: number | null) => {
        if (!tierId) return 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-300';
        switch (tierId) {
            case 1: return 'bg-amber-400 hover:bg-amber-500 focus:ring-amber-300';
            case 2: return 'bg-sky-400 hover:bg-sky-500 focus:ring-sky-300';
            case 3: return 'bg-rose-400 hover:bg-rose-500 focus:ring-rose-300';
            default: return 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-300';
        }
    };

    const drawButtonColorClass = getButtonColorClass(selectedTierId);

    return (
        <div className="w-full max-w-lg p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60">
            <div className="flex gap-4">
                {/* Left: Prize Selection */}
                <div className="flex flex-col gap-2 w-2/5">
                    {prizeTiers.map((tier) => {
                        const prize = prizes.find(p => p.id === tier.id);
                        const remainingSlots = remainingSlotsByTier[tier.id];
                        const isSelected = selectedTierId === tier.id;

                        return (
                            <button
                                key={tier.id}
                                onClick={() => onSelectedTierIdChange(tier.id)}
                                disabled={isDrawing}
                                className={`w-full p-2 rounded-lg text-center transition-all h-full flex flex-col justify-center
                                    ${isSelected ? `${tier.color.list} shadow-lg ring-2 ring-pink-400 ring-offset-2` : 'bg-white hover:bg-gray-50'}
                                `}
                            >
                                <span className="font-bold text-base">{prize?.name || `경품 ${tier.id}`}</span>
                                <span className="text-xs mt-1">({remainingSlots}/{tier.count} 남음)</span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Draw Buttons */}
                <div className="w-3/5 flex flex-col items-center gap-2">
                    <button
                        onClick={onReset}
                        disabled={isDrawing || selectedTierId === null}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-md shadow-sm transition-all text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        초기화
                    </button>
                    <div className="w-full h-full">
                        {selectedTierId ? (
                            <div className="grid grid-cols-2 gap-3">
                                {drawCounts.map((count) => (
                                    <DrawButton
                                        key={count}
                                        count={count}
                                        onDraw={onDraw}
                                        isDisabled={isDrawing || remainingCount < count || remainingPrizes <= 0 || count > remainingForSelectedTier}
                                        colorClass={drawButtonColorClass}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100/80 rounded-lg text-center">
                                <p className="text-gray-500 font-medium">경품을<br />선택하세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawControls;