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

interface WinnerDisplayProps {
    winners: (number | undefined)[];
    remaining: number;
    totalPrizes: number;
    totalParticipants: number;
    onTotalParticipantsChange: (count: number) => void;
    prizeTiers: PrizeTier[];
}

const EditableValue: React.FC<{ value: number; onChange: (newValue: number) => void; className?: string }> = ({ value, onChange, className }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value.toString());

    useEffect(() => {
        setCurrentValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        const newValue = parseInt(currentValue, 10);
        if (!isNaN(newValue) && newValue !== value) {
            onChange(newValue);
        } else {
            setCurrentValue(value.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setCurrentValue(value.toString());
        }
    };

    if (isEditing) {
        return (
            <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`w-24 text-center bg-white/70 rounded-md outline-none focus:ring-2 focus:ring-pink-500 ${className}`}
            />
        );
    }

    return (
        <span onClick={() => setIsEditing(true)} className={`cursor-pointer hover:bg-pink-200/50 px-2 rounded-md transition-colors ${className}`}>
            {value}
        </span>
    );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={`p-4 rounded-lg text-center shadow-md ${className}`}>
        <span className="text-lg font-bold block">{label}</span>
        <div className="text-4xl font-black">{value}</div>
    </div>
);


const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners, remaining, totalPrizes, totalParticipants, onTotalParticipantsChange, prizeTiers }) => {
    const getTierForIndex = (winnerIndex: number) => {
        let cumulativeCount = 0;
        for (const tier of prizeTiers) {
            cumulativeCount += tier.count;
            if (winnerIndex < cumulativeCount) {
                return tier;
            }
        }
        // Fallback to the last tier or a default color
        return prizeTiers[prizeTiers.length - 1] || { color: { winner: 'bg-gray-200 text-gray-800' } };
    };
    
    const actualWinners = winners.filter((w): w is number => w !== undefined);

    return (
        <div className="w-full h-full bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/60">
            <div className="flex flex-col sm:flex-row justify-center items-center mb-4 pb-4 border-b-2 border-pink-200 gap-4">
                <h2 className="text-4xl font-extrabold text-gray-800 shrink-0">🏆 당첨자 현황</h2>
                <div className="flex flex-wrap justify-center gap-4 w-full">
                     <StatCard 
                        label="당첨"
                        value={
                            <div className="flex items-center justify-center gap-1">
                                <span className="px-2">{actualWinners.length}</span>
                                <span className="text-2xl font-medium"> / </span>
                                <span>{totalPrizes}</span>
                            </div>
                        }
                        className="bg-pink-100 text-pink-800"
                     />
                    <StatCard 
                        label="남은 인원"
                        value={<span>{remaining}</span>}
                        className="bg-sky-100 text-sky-800"
                    />
                    <StatCard 
                        label="총 인원"
                        value={<EditableValue value={totalParticipants} onChange={onTotalParticipantsChange} />}
                        className="bg-gray-100 text-gray-800"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3 h-[380px] overflow-y-auto pr-2">
                {actualWinners.length > 0 ? (
                    winners.map((winner, index) => {
                        if (winner === undefined) return null;
                        const tier = getTierForIndex(index);
                        return (
                            <div key={winner} className={`flex items-center justify-center text-xl font-bold h-14 rounded-full shadow-sm ${tier.color.winner}`}>
                                {winner}
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full flex items-center justify-center h-full">
                        <p className="text-xl text-gray-500">아직 당첨자가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WinnerDisplay;