import { useTrivia } from '../hooks/useTrivia';

interface TriviaGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function TriviaGame({ onBack, onComplete }: TriviaGameProps) {
  const { 
    tIndex, tScore, timeLeft, tFinished, 
    currentQuestion, totalQuestions, 
    handleTriviaAnswer, resetTrivia 
  } = useTrivia(onComplete);

  return (
    <div>
      {!tFinished ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-blue)', marginBottom: '1rem', fontWeight: 'bold' }}>
            <span>Pregunta {tIndex + 1}/{totalQuestions}</span>
            <span>⏳ {timeLeft}s</span>
          </div>
          <h2 className="trivia-question">{currentQuestion.q}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentQuestion.options.map((opt, i) => (
              <button key={i} className="trivia-btn" onClick={() => handleTriviaAnswer(i)}>
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>¡Trivia Completada!</h2>
          <div className="final-score">{tScore} pts</div>
          <button className="btn-guardar" onClick={resetTrivia} style={{ marginRight: '10px' }}>Jugar de nuevo</button>
          <button className="btn-guardar" onClick={onBack} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>Volver al menú</button>
        </div>
      )}
    </div>
  );
}