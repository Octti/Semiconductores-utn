import { useState, useEffect } from 'react';
import './App.css';

// Configuración para Vercel (toma la URL de la nube o usa localhost por defecto)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- DATOS DE LOS JUEGOS ---

const triviaData = [
  { q: "En 1907, ¿quién observó por primera vez la electroluminiscencia al aplicar corriente a cristales de carburo de silicio?", options: ["Thomas Edison", "Henry Joseph Round", "Oleg Lósev"], correct: 1 },
  { q: "¿En qué año Oleg Lósev presentó la primera patente registrada para un 'relé luminoso'?", options: ["1907", "1927", "1955"], correct: 1 },
  { q: "¿Qué científico es reconocido como el «padre del diodo emisor de luz» por crear el primer LED rojo visible en 1962?", options: ["Nick Holonyak Jr.", "Rubin Braunstein", "James R. Biard"], correct: 0 },
  { q: "¿Qué elemento añadió M. George Craford en 1972 para lograr la invención del primer LED amarillo?", options: ["Nitrógeno", "Fósforo", "Magnesio"], correct: 0 },
  { q: "¿Qué empresa desarrolló la solución de conversión por fósforo (pc-LED) en 1995 para generar luz blanca?", options: ["Texas Instruments", "Monsanto Company", "Nichia Corporation"], correct: 2 },
  { q: "¿Por qué avance ganaron el Premio Nobel de Física en 2014 Isamu Akasaki, Hiroshi Amano y Shuji Nakamura?", options: ["El LED Infrarrojo", "El LED azul eficiente", "Las pantallas OLED"], correct: 1 },
  { q: "En la agricultura vertical, ¿qué efecto tiene la longitud de onda azul en las plantas?", options: ["Promueve la floración", "Evita el estiramiento excesivo del tallo", "Aumenta la temperatura ambiente"], correct: 1 },
  { q: "Según la Agencia Internacional de Energía, ¿qué porcentaje del consumo eléctrico mundial representa la iluminación?", options: ["10%", "20%", "40%"], correct: 1 }
];

const matchMaterials = [
  { id: 'm1', text: 'Carburo de Silicio (1907)' },
  { id: 'm2', text: 'Arseniuro de Galio (1961)' },
  { id: 'm3', text: 'Arseniuro-fosfuro de galio (1962)' },
  { id: 'm4', text: 'Nitruro de Galio e Indio (1993)' }
];
const matchColors = [
  { id: 'c1', text: 'Luz amarillenta tenue', match: 'm1' },
  { id: 'c2', text: 'Radiación infrarroja de alta intensidad', match: 'm2' },
  { id: 'c3', text: 'Luz brillante de tonalidad roja', match: 'm3' },
  { id: 'c4', text: 'Luz azul brillante (450 nm)', match: 'm4' }
];

const timelineEvents = [
  { id: 1, year: 1907, text: 'H. J. Round presencia el fenómeno de la electroluminiscencia en estado sólido.' },
  { id: 2, year: 1961, text: 'Biard y Pittman patentan el primer diodo emisor de luz infrarroja comercial.' },
  { id: 3, year: 1968, text: 'Hewlett-Packard y Monsanto masifican el uso del LED.' },
  { id: 4, year: 1993, text: 'Shuji Nakamura inventa el LED azul brillante comercial.' },
  { id: 5, year: 2006, text: 'El LED supera la barrera de eficiencia de los 100 lm/W frente a la luz incandescente.' }
];

interface ScoreEntry {
  name: string;
  score: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'jugar' | 'ranking' | 'recursos'>('jugar');
  const [activeGame, setActiveGame] = useState<'none' | 'trivia' | 'match' | 'timeline'>('none');
  const [playerName, setPlayerName] = useState('');
  
  // Estados Globales (Ranking)
  const [globalScore, setGlobalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Trivia
  const [tIndex, setTIndex] = useState(0);
  const [tScore, setTScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [tFinished, setTFinished] = useState(false);

  // Estados Match
  const [shuffledColors, setShuffledColors] = useState([...matchColors].sort(() => Math.random() - 0.5));
  const [selMat, setSelMat] = useState<string | null>(null);
  const [selCol, setSelCol] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mScore, setMScore] = useState(0);
  const [mFinished, setMFinished] = useState(false);

  // Estados Timeline
  const [tlItems, setTlItems] = useState([...timelineEvents].sort(() => Math.random() - 0.5));
  const [tlScore, setTlScore] = useState(0);
  const [tlFinished, setTlFinished] = useState(false);

  // --- CONEXIÓN AL BACKEND ---
  
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scores`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error obteniendo ranking:", error);
    }
  };

  const saveScore = async () => {
    if (!playerName.trim() || isSaving || globalScore === 0) return;
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName.trim(), score: globalScore })
      });
      setGlobalScore(0); // Resetea puntaje no guardado
      await fetchLeaderboard();
      setActiveTab('ranking');
      setActiveGame('none');
    } catch (error) {
      console.error("Error guardando puntaje:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cargar ranking al abrir la pestaña correspondiente
  useEffect(() => {
    if (activeTab === 'ranking') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  // --- LÓGICA TRIVIA ---
  useEffect(() => {
    if (activeGame === 'trivia' && !tFinished && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && activeGame === 'trivia' && !tFinished) {
      handleTriviaAnswer(-1);
    }
  }, [timeLeft, activeGame, tFinished]);

  const handleTriviaAnswer = (selectedIndex: number) => {
    if (selectedIndex === triviaData[tIndex].correct) setTScore(prev => prev + (timeLeft * 10));
    if (tIndex + 1 < triviaData.length) { setTIndex(tIndex + 1); setTimeLeft(15); } 
    else {
        setTFinished(true);
        setGlobalScore(prev => prev + tScore + (timeLeft * 10));
    }
  };
  const resetTrivia = () => { setTIndex(0); setTScore(0); setTimeLeft(15); setTFinished(false); setActiveGame('trivia'); };

  // --- LÓGICA MATCH ---
  useEffect(() => {
    if (selMat && selCol) {
      const colorItem = shuffledColors.find(c => c.id === selCol);
      if (colorItem?.match === selMat) {
        setMatched(prev => [...prev, selMat, selCol]);
        setMScore(prev => prev + 50);
      }
      setTimeout(() => { setSelMat(null); setSelCol(null); }, 500);
    }
  }, [selMat, selCol]);

  useEffect(() => { 
      if (matched.length === 8) {
          setMFinished(true);
          setGlobalScore(prev => prev + 200); // Puntaje máximo del match
      }
  }, [matched]);
  const resetMatch = () => { setMatched([]); setMScore(0); setSelMat(null); setSelCol(null); setMFinished(false); setShuffledColors([...matchColors].sort(() => Math.random() - 0.5)); setActiveGame('match'); };

  // --- LÓGICA TIMELINE ---
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...tlItems];
    if (direction === 'up' && index > 0) [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    else if (direction === 'down' && index < newItems.length - 1) [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setTlItems(newItems);
  };
  const checkTimeline = () => {
    let isCorrect = true;
    for (let i = 0; i < tlItems.length - 1; i++) { if (tlItems[i].year > tlItems[i + 1].year) isCorrect = false; }
    const finalScore = isCorrect ? 300 : 0;
    setTlScore(finalScore);
    setTlFinished(true);
    setGlobalScore(prev => prev + finalScore);
  };
  const resetTimeline = () => { setTlItems([...timelineEvents].sort(() => Math.random() - 0.5)); setTlScore(0); setTlFinished(false); setActiveGame('timeline'); };

  const renderGameArea = () => (
    <div className="panel-container" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="nav-tab" style={{ border: '1px solid var(--border-color)' }} onClick={() => setActiveGame('none')}>
          ← Volver al Menú
        </button>
        <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Acumulado: {globalScore} pts</div>
      </div>

      {activeGame === 'trivia' && (
        <div>
          {!tFinished ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-blue)', marginBottom: '1rem', fontWeight: 'bold' }}>
                <span>Pregunta {tIndex + 1}/{triviaData.length}</span>
                <span>⏳ {timeLeft}s</span>
              </div>
              <h2 className="trivia-question">{triviaData[tIndex].q}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {triviaData[tIndex].options.map((opt, i) => (
                  <button key={i} className="trivia-btn" onClick={() => handleTriviaAnswer(i)}>{opt}</button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2>¡Trivia Completada!</h2>
              <div className="final-score">{tScore} pts</div>
              <button className="btn-guardar" onClick={resetTrivia}>Jugar de nuevo</button>
            </div>
          )}
        </div>
      )}

      {activeGame === 'match' && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Seleccioná un Material y su Color emitido</h2>
          {!mFinished ? (
            <div className="match-grid">
              <div className="match-column">
                {matchMaterials.map(m => (
                  <button key={m.id} disabled={matched.includes(m.id)} className="btn-match"
                    style={{ border: `2px solid ${selMat === m.id ? 'var(--accent-blue)' : matched.includes(m.id) ? 'var(--accent-green)' : 'var(--border-color)'}`, background: matched.includes(m.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                    onClick={() => setSelMat(m.id)}>{m.text}</button>
                ))}
              </div>
              <div className="match-column">
                {shuffledColors.map(c => (
                  <button key={c.id} disabled={matched.includes(c.id)} className="btn-match"
                    style={{ border: `2px solid ${selCol === c.id ? 'var(--accent-purple)' : matched.includes(c.id) ? 'var(--accent-green)' : 'var(--border-color)'}`, background: matched.includes(c.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                    onClick={() => setSelCol(c.id)}>{c.text}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2>¡Match Completado!</h2>
              <div className="final-score">{mScore} pts</div>
              <button className="btn-guardar" onClick={resetMatch}>Jugar de nuevo</button>
            </div>
          )}
        </div>
      )}

      {activeGame === 'timeline' && (
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
              <button className="btn-guardar" onClick={resetTimeline}>Intentar de nuevo</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="logo-section">
          <div className="dots"><span className="dot red"></span><span className="dot green"></span><span className="dot blue"></span></div>
          SEMICONDUCTORES
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'jugar' ? 'active' : ''}`} onClick={() => { setActiveTab('jugar'); setActiveGame('none'); }}>Jugar</button>
          <button className={`nav-tab ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>Ranking</button>
          <button className={`nav-tab ${activeTab === 'recursos' ? 'active' : ''}`} onClick={() => setActiveTab('recursos')}>Recursos</button>
        </div>
      </nav>

      <main>
        {activeTab === 'jugar' && activeGame === 'none' && (
          <>
            <div className="hero-section">
              <h1 className="hero-title">De la Física de Semiconductores a<br />la Revolución Lumínica</h1>
              <p className="hero-subtitle">Trivia y minijuegos sobre cómo un cristal, unos electrones y una banda prohibida cambiaron la forma de iluminar el mundo.</p>
              
              <div className="save-input-group" style={{ flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <input type="text" placeholder="Tu nombre para el ranking" value={playerName} onChange={(e) => setPlayerName(e.target.value)} maxLength={15}/>
                  <button className="btn-guardar" onClick={saveScore} disabled={isSaving || globalScore === 0 || !playerName.trim()}>
                    {isSaving ? 'Guardando...' : `Guardar ${globalScore} pts`}
                  </button>
                </div>
                {globalScore === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jugá un minijuego primero para sumar puntos.</span>}
              </div>
            </div>
            
            <div className="games-grid">
              <div className="game-card" onClick={() => resetTrivia()}>
                <div className="game-icon">⚡</div>
                <h3>Trivia Cuántica</h3>
                <p>8 preguntas contra reloj. Cuanto más rápido, más puntos.</p>
                <div className="game-score">Jugar →</div>
              </div>
              <div className="game-card" onClick={() => resetMatch()}>
                <div className="game-icon">🎨</div>
                <h3>Match de Bandgap</h3>
                <p>Uní cada material semiconductor con el color de luz que emite.</p>
                <div className="game-score">Jugar →</div>
              </div>
              <div className="game-card" onClick={() => resetTimeline()}>
                <div className="game-icon">⏳</div>
                <h3>Línea del Tiempo</h3>
                <p>Ordená los hitos del LED, del más antiguo al más reciente.</p>
                <div className="game-score">Jugar →</div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'jugar' && activeGame !== 'none' && renderGameArea()}

        {activeTab === 'ranking' && (
          <div className="panel-container">
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>🏆 Top 10 Global</h2>
            
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Todavía no hay puntajes en la base de datos.</p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(148, 163, 184, 0.7)' }}>¡Sé el primero en guardar un resultado!</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {leaderboard.map((entry, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', justifyContent: 'space-between', padding: '1rem', 
                    background: idx === 0 ? 'rgba(250, 204, 21, 0.1)' : idx === 1 ? 'rgba(148, 163, 184, 0.1)' : idx === 2 ? 'rgba(180, 83, 9, 0.1)' : 'rgba(255, 255, 255, 0.03)', 
                    borderLeft: `4px solid ${idx === 0 ? '#facc15' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'transparent'}`,
                    border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 'bold' 
                  }}>
                    <span>{idx + 1}. {entry.name}</span>
                    <span style={{ color: 'var(--accent-blue)' }}>{entry.score} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'recursos' && (
          <div className="recursos-container">
            <section>
              <h3 style={{ marginBottom: '1rem' }}>Eficacia Luminosa</h3>
              <div className="equation-box">
                <h2>100 - 200+ lm/W</h2>
                <p style={{ color: 'var(--text-muted)' }}>Eficacia actual de la tecnología LED frente a los 12-18 lm/W de la lámpara incandescente tradicional.</p>
              </div>
            </section>
            <section>
              <h3 style={{ marginBottom: '1rem' }}>Conceptos clave de la monografía</h3>
              <div className="conceptos-list">
                <details><summary>Electroluminiscencia de estado sólido</summary><p>Emisión directa de luz por parte de un material semiconductor al ser atravesado por una corriente eléctrica, sin recurrir al calentamiento de un filamento.</p></details>
                <details><summary>Conversión por fósforo (pc-LED)</summary><p>Técnica de 1995 que recubre un chip LED azul (InGaN) con fósforo YAG para sintetizar luz blanca de alta intensidad.</p></details>
                <details><summary>Li-Fi y VLC</summary><p>Comunicación por Luz Visible; utiliza la conmutación rápida de los semiconductores LED para transmitir datos e internet, inmune a interferencias de radiofrecuencia.</p></details>
                <details><summary>Indoor Farming y Recetas de Luz</summary><p>La especialización espectral en rojo (660nm) acelera la floración, mientras que el azul (450nm) evita el estiramiento del tallo y mejora la densidad foliar en granjas verticales.</p></details>
                <details><summary>Impacto ambiental y PERMER</summary><p>El uso de LED reduce emisiones de CO2 y, al no contener mercurio (a diferencia de las CFL), previene contaminación. En Argentina, proyectos como PERMER llevan iluminación LED a zonas sin red eléctrica.</p></details>
              </div>
            </section>
            <section>
              <h3 style={{ marginBottom: '1rem' }}>Línea del tiempo</h3>
              <div className="timeline">
                <div className="timeline-item"><h4>1907</h4><p>H. J. Round observa electroluminiscencia en carburo de silicio.</p></div>
                <div className="timeline-item"><h4>1962</h4><p>Nick Holonyak Jr. sintetiza GaAsP y crea el primer LED de luz visible (rojo).</p></div>
                <div className="timeline-item"><h4>1972</h4><p>M. George Craford dopa aleaciones con nitrógeno y desarrolla el LED amarillo.</p></div>
                <div className="timeline-item"><h4>1993</h4><p>Shuji Nakamura supera el "enigma del Nitruro de Galio" y logra el LED azul brillante.</p></div>
                <div className="timeline-item"><h4>2014</h4><p>Akasaki, Amano y Nakamura reciben el Premio Nobel de Física por el LED azul eficiente.</p></div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;