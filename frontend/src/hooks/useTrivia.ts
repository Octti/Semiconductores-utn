import { useState, useEffect } from 'react';
import { triviaData } from '../data/gamesData';

export function useTrivia(onComplete: (score: number) => void) {
  const [tIndex, setTIndex] = useState(0);
  const [tScore, setTScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [tFinished, setTFinished] = useState(false);

  // Temporizador
  useEffect(() => {
    if (!tFinished && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !tFinished) {
      handleTriviaAnswer(-1); // Se acabó el tiempo
    }
  }, [timeLeft, tFinished]);

  const handleTriviaAnswer = (selectedIndex: number) => {
    let newScore = tScore;
    
    if (selectedIndex === triviaData[tIndex].correct) {
      const pointsEarned = timeLeft * 10;
      newScore += pointsEarned;
      setTScore(newScore);
    }
    
    if (tIndex + 1 < triviaData.length) {
      setTIndex(tIndex + 1);
      setTimeLeft(15);
    } else {
      setTFinished(true);
      onComplete(newScore); // Le avisa al App.tsx cuántos puntos sumó
    }
  };

  const resetTrivia = () => {
    setTIndex(0);
    setTScore(0);
    setTimeLeft(15);
    setTFinished(false);
  };

  return {
    tIndex,
    tScore,
    timeLeft,
    tFinished,
    currentQuestion: triviaData[tIndex],
    totalQuestions: triviaData.length,
    handleTriviaAnswer,
    resetTrivia
  };
}