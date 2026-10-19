import { useState } from 'react';
import { timelineEvents } from '../data/gamesData';

export function useTimeline(onComplete: (score: number) => void) {
  const [tlItems, setTlItems] = useState([...timelineEvents].sort(() => Math.random() - 0.5));
  const [tlScore, setTlScore] = useState(0);
  const [tlFinished, setTlFinished] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...tlItems];
    if (direction === 'up' && index > 0) [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    else if (direction === 'down' && index < newItems.length - 1) [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setTlItems(newItems);
  };

  const checkTimeline = () => {
    let isCorrect = true;
    for (let i = 0; i < tlItems.length - 1; i++) {
      if (tlItems[i].year > tlItems[i + 1].year) isCorrect = false;
    }
    const finalScore = isCorrect ? 300 : 0;
    setTlScore(finalScore);
    setTlFinished(true);
    onComplete(finalScore);
  };

  const resetTimeline = () => {
    setTlItems([...timelineEvents].sort(() => Math.random() - 0.5));
    setTlScore(0);
    setTlFinished(false);
  };

  return { tlItems, moveItem, checkTimeline, tlScore, tlFinished, resetTimeline };
}