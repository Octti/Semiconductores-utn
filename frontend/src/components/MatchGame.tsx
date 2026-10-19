import { useMatch } from '../hooks/useMatch';
import { matchMaterials } from '../data/gamesData';

interface MatchGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function MatchGame({ onBack, onComplete }: MatchGameProps) {
  const { shuffledColors, selMat, setSelMat, selCol, setSelCol, matched, mScore, mFinished, resetMatch } = useMatch(onComplete);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Seleccioná un Material y su Color emitido</h2>
      {!mFinished ? (
        <div className="match-grid">
          <div className="match-column">
            {matchMaterials.map(m => (
              <button key={m.id} disabled={matched.includes(m.id)} className="btn-match"
                style={{ border: `2px solid ${selMat === m.id ? 'var(--accent-blue)' : matched.includes(m.id) ? 'var(--accent-green)' : 'var(--border-color)'}`, background: matched.includes(m.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                onClick={() => setSelMat(m.id)}>{m.text}
              </button>
            ))}
          </div>
          <div className="match-column">
            {shuffledColors.map(c => (
              <button key={c.id} disabled={matched.includes(c.id)} className="btn-match"
                style={{ border: `2px solid ${selCol === c.id ? 'var(--accent-purple)' : matched.includes(c.id) ? 'var(--accent-green)' : 'var(--border-color)'}`, background: matched.includes(c.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                onClick={() => setSelCol(c.id)}>{c.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>¡Match Completado!</h2>
          <div className="final-score">{mScore} pts</div>
          <button className="btn-guardar" onClick={resetMatch} style={{ marginRight: '10px' }}>Jugar de nuevo</button>
          <button className="btn-guardar" onClick={onBack} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>Volver al menú</button>
        </div>
      )}
    </div>
  );
}