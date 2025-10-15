import { useState, useCallback } from 'react';

interface PrizeTier {
    id: number;
    count: number;
}

export const useRaffle = () => {
    const [participants, setParticipants] = useState<number[]>(() => Array.from({ length: 150 }, (_, i) => i + 1));
    const [winners, setWinners] = useState<(number | undefined)[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [lastDrawn, setLastDrawn] = useState<number[]>([]);

    const performDraw = useCallback((count: number, currentParticipants: number[]) => {
        if (count <= 0 || currentParticipants.length === 0) {
            return { newWinners: [], updatedParticipants: currentParticipants };
        }
        
        const drawCount = Math.min(count, currentParticipants.length);
        const availableParticipants = [...currentParticipants];
        const drawnWinners: number[] = [];

        for (let i = 0; i < drawCount; i++) {
            if (availableParticipants.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableParticipants.length);
            const winner = availableParticipants.splice(randomIndex, 1)[0];
            drawnWinners.push(winner);
        }
        
        return { newWinners: drawnWinners, updatedParticipants: availableParticipants };
    }, []);

    const draw = useCallback((count: number, tierId: number, prizeTiers: PrizeTier[], totalPrizes: number) => {
        if (isDrawing) return;

        const tier = prizeTiers.find(t => t.id === tierId);
        if (!tier) return;

        let startIndex = 0;
        for (const pt of prizeTiers) {
            if (pt.id < tierId) {
                startIndex += pt.count;
            }
        }

        const tierSlice = winners.slice(startIndex, startIndex + tier.count);
        const winnersInTierCount = tierSlice.filter(w => w !== undefined).length;
        const availableSlotsInTier = tier.count - winnersInTierCount;

        const currentTotalWinners = winners.filter(w => w !== undefined).length;
        const remainingPrizesOverall = totalPrizes - currentTotalWinners;

        const drawableCount = Math.min(count, participants.length, remainingPrizesOverall, availableSlotsInTier);
        
        if (drawableCount <= 0) return;

        setIsDrawing(true);
        setLastDrawn([]);

        setTimeout(() => {
            const { newWinners, updatedParticipants } = performDraw(drawableCount, participants);
            
            if (newWinners.length > 0) {
                setLastDrawn(newWinners);
                
                const updatedWinners = [...winners];
                let drawnIndex = 0;
                for (let i = 0; i < tier.count && drawnIndex < newWinners.length; i++) {
                    const winnerIndex = startIndex + i;
                    if (updatedWinners[winnerIndex] === undefined) {
                        updatedWinners[winnerIndex] = newWinners[drawnIndex];
                        drawnIndex++;
                    }
                }

                setWinners(updatedWinners);
                setParticipants(updatedParticipants);
            }
            setIsDrawing(false);
        }, 1000);
    }, [isDrawing, participants, winners, performDraw]);

    const updateTotalParticipants = useCallback((newTotal: number) => {
        if (isDrawing || newTotal < 0) return;
    
        const currentWinners = winners.filter((w): w is number => w !== undefined);
        if (newTotal < currentWinners.length) {
            console.error("Total participants cannot be less than the number of winners.");
            return;
        }
    
        const currentRemainingCount = participants.length;
        const newRemainingCount = newTotal - currentWinners.length;
        const diff = newRemainingCount - currentRemainingCount;
    
        if (diff > 0) { // Add participants
            const allNumbers = [...participants, ...currentWinners];
            const maxNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
            const newParticipantsToAdd = Array.from({ length: diff }, (_, i) => maxNumber + i + 1);
            
            setParticipants(prev => [...prev, ...newParticipantsToAdd].sort((a, b) => a - b));
        } else if (diff < 0) { // Remove participants
            const numToRemove = Math.abs(diff);
            if (numToRemove > participants.length) return;
    
            const participantsToRemoveFrom = [...participants];
            // Shuffle to remove random participants
            for (let i = participantsToRemoveFrom.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [participantsToRemoveFrom[i], participantsToRemoveFrom[j]] = [participantsToRemoveFrom[j], participantsToRemoveFrom[i]];
            }
            
            const remainingParticipants = participantsToRemoveFrom.slice(numToRemove);
            setParticipants(remainingParticipants.sort((a, b) => a - b));
        }
    }, [isDrawing, participants, winners]);


    const resetTier = useCallback((tierId: number, prizeTiers: PrizeTier[]) => {
        const tier = prizeTiers.find(t => t.id === tierId);
        if (!tier) return;
        
        let startIndex = 0;
        for (const pt of prizeTiers) {
            if (pt.id < tierId) {
                startIndex += pt.count;
            }
        }
        
        const winnersToReset = winners.slice(startIndex, startIndex + tier.count).filter((w): w is number => w !== undefined);

        if (winnersToReset.length > 0) {
            setParticipants(prev => [...prev, ...winnersToReset].sort((a, b) => a - b));
            
            const updatedWinners = [...winners];
            for(let i = 0; i < tier.count; i++) {
                updatedWinners[startIndex + i] = undefined;
            }
            setWinners(updatedWinners);
        }
    }, [winners]);
    
    const clearLastDrawn = useCallback(() => {
        setLastDrawn([]);
    }, []);

    return {
        participants,
        winners,
        isDrawing,
        lastDrawn,
        draw,
        resetTier,
        clearLastDrawn,
        updateTotalParticipants
    };
};