import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import RaffleBox from './components/RaffleBox';
import DrawControls from './components/DrawControls';
import WinnerDisplay from './components/WinnerDisplay';
import ResultModal from './components/ResultModal';
import PrizeList from './components/PrizeList';
import { useRaffle } from './hooks/useRaffle';

// FIX: Added 'name' property to provide a default name for each prize tier.
const prizeTiers = [
    { 
        id: 1, 
        name: '경품 1',
        count: 10, 
        color: { 
            list: 'bg-amber-200 text-amber-800', 
            winner: 'bg-amber-300 text-amber-900',
            modal: 'bg-amber-400 text-white'
        } 
    },
    { 
        id: 2, 
        name: '경품 2',
        count: 10, 
        color: { 
            list: 'bg-sky-200 text-sky-800', 
            winner: 'bg-sky-300 text-sky-900',
            modal: 'bg-sky-400 text-white'
        } 
    },
    { 
        id: 3, 
        name: '경품 3',
        count: 10, 
        color: { 
            list: 'bg-rose-200 text-rose-800', 
            winner: 'bg-rose-300 text-rose-900',
            modal: 'bg-rose-400 text-white'
        }
    },
];


const App: React.FC = () => {
    const [prizes, setPrizes] = useState(() => 
        prizeTiers.map(p => ({ id: p.id, name: p.name, count: p.count }))
    );
    const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
    const [totalParticipants, setTotalParticipants] = useState(150);
    
    const { 
        participants, 
        winners, 
        isDrawing, 
        lastDrawn,
        draw, 
        resetTier,
        clearLastDrawn,
        updateTotalParticipants
    } = useRaffle();

    useEffect(() => {
        if (updateTotalParticipants) {
            updateTotalParticipants(totalParticipants);
        }
    }, [totalParticipants, updateTotalParticipants]);

    const totalPrizes = useMemo(() => prizes.reduce((sum, p) => sum + p.count, 0), [prizes]);

    const mergedPrizeTiers = useMemo(() => prizeTiers.map(tier => {
        const prizeData = prizes.find(p => p.id === tier.id);
        return { 
            ...tier, 
            name: prizeData?.name || ``,
            count: prizeData?.count || 0 
        };
    }), [prizes]);

    const handleTierReset = () => {
        if (selectedTierId !== null) {
            resetTier(selectedTierId, mergedPrizeTiers);
            setSelectedTierId(null);
        }
    };

    const handleDraw = (count: number) => {
        if (selectedTierId !== null) {
            draw(count, selectedTierId, mergedPrizeTiers, totalPrizes);
        }
    };

    const currentWinnerCount = useMemo(() => winners.filter(w => w !== undefined).length, [winners]);

    return (
        <div className="bg-transparent min-h-screen flex flex-col items-center p-4 lg:p-8 text-gray-800 selection:bg-pink-300">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-8">
                {/* Left Column */}
                <div className="w-full md:w-5/12 flex flex-col items-center gap-4">
                    <PrizeList 
                        prizeTiers={mergedPrizeTiers}
                        prizes={prizes}
                        onPrizesChange={setPrizes}
                    />
                    <RaffleBox isDrawing={isDrawing} />
                    <DrawControls 
                        onDraw={handleDraw} 
                        onReset={handleTierReset} 
                        isDrawing={isDrawing}
                        remainingCount={participants.length} 
                        winnerCount={currentWinnerCount}
                        totalPrizes={totalPrizes}
                        prizeTiers={mergedPrizeTiers}
                        prizes={prizes}
                        winners={winners}
                        selectedTierId={selectedTierId}
                        onSelectedTierIdChange={setSelectedTierId}
                    />
                </div>
                
                {/* Right Column */}
                <div className="w-full md:w-7/12 flex flex-col gap-8">
                    <Header />
                    <WinnerDisplay 
                        winners={winners} 
                        remaining={participants.length}
                        totalPrizes={totalPrizes}
                        totalParticipants={totalParticipants}
                        onTotalParticipantsChange={setTotalParticipants}
                        prizeTiers={mergedPrizeTiers}
                     />
                </div>
            </div>
            {lastDrawn.length > 0 && selectedTierId !== null && (
                <ResultModal 
                    numbers={lastDrawn} 
                    onClose={clearLastDrawn} 
                    prizeTiers={mergedPrizeTiers}
                    drawnTierId={selectedTierId}
                />
            )}
        </div>
    );
};

export default App;