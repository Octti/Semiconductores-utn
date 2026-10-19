import { useTimeline } from '../hooks/useTimeLine';

interface TimelineGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function TimelineGame({ onBack, onComplete }: TimelineGameProps) {
  const { tlItems, moveItem, checkTimeline, tlScore, tlFinished, resetTimeline } = useTimeline(onComplete);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Ordená cronológicamente (Más antiguo arriba)</h2>
      {!tlFinished ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
            {tlItems.map((item, index) => (
              <div key={item.id} className="timeline-row">
                <div className="timeline-controls">
                  <button onClick={() => moveItem(index, 'up')} disabled={index === 0}>▲</button>
                  <button onClick={() => moveItem(index, 'down')} disabled={index === tlItems.length - 1}>▼</button>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn-guardar" onClick={checkTimeline}>Comprobar Orden</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>{tlScore === 300 ? '¡Orden Correcto!' : 'Orden Incorrecto'}</h2>
          <div className="final-score" style={{ color: tlScore > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{tlScore} pts</div>
          <button className="btn-guardar" onClick={resetTimeline} style={{ marginRight: '10px' }}>Intentar de nuevo</button>
          <button className="btn-guardar" onClick={onBack} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>Volver al menú</button>
        </div>
      )}
    </div>
  );
}