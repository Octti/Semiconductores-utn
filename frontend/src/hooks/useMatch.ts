import { useState, useEffect } from 'react';
import { matchColors } from '../data/gamesData';

export function useMatch(onComplete: (score: number) => void) {
  const [shuffledColors, setShuffledColors] = useState([...matchColors].sort(() => Math.random() - 0.5));
  const [selMat, setSelMat] = useState<string | null>(null);
  const [selCol, setSelCol] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mScore, setMScore] = useState(0);
  const [mFinished, setMFinished] = useState(false);

  useEffect(() => {
    if (selMat && selCol) {
      const colorItem = shuffledColors.find(c => c.id === selCol);
      if (colorItem?.match === selMat) {
        setMatched(prev => [...prev, selMat, selCol]);
        setMScore(prev => prev + 50);
      }
      setTimeout(() => { setSelMat(null); setSelCol(null); }, 500);
    }
  }, [selMat, selCol, shuffledColors]);

  useEffect(() => {
    if (matched.length === 8 && !mFinished) {
      setMFinished(true);
      onComplete(200); // 4 pares x 50 puntos
    }
  }, [matched, mFinished, onComplete]);

  const resetMatch = () => {
    setMatched([]);
    setMScore(0);
    setSelMat(null);
    setSelCol(null);
    setMFinished(false);
    setShuffledColors([...matchColors].sort(() => Math.random() - 0.5));
  };

  return { shuffledColors, selMat, setSelMat, selCol, setSelCol, matched, mScore, mFinished, resetMatch };
}