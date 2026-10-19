import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";
import { TriviaGame } from "./components/TriviaGame";
import { MatchGame } from "./components/MatchGame";
import { TimelineGame } from "./components/TimeLineGame";
import { Recursos } from "./components/Recursos";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ScoreEntry {
  name: string;
  score: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<"jugar" | "ranking" | "recursos">(
    "jugar",
  );
  const [activeGame, setActiveGame] = useState<
    "none" | "trivia" | "match" | "timeline"
  >("none");
  const [playerName, setPlayerName] = useState("");

  const [globalScore, setGlobalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName.trim(), score: globalScore }),
      });
      setGlobalScore(0);
      await fetchLeaderboard();
      setActiveTab("ranking");
      setActiveGame("none");
    } catch (error) {
      console.error("Error guardando puntaje:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const compartirPuntaje = async () => {
    const texto = `¡Logré ${globalScore} puntos en la web de la Revolución Lumínica (LED) 💡! ¿Te animás a superarme en el ranking?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Semiconductores",
          text: texto,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Interacción de compartir cancelada", error);
      }
    } else {
      navigator.clipboard.writeText(
        `${texto} Jugá acá: ${window.location.href}`,
      );
      alert("¡Texto copiado al portapapeles listo para pegar en WhatsApp!");
    }
  };

  useEffect(() => {
    if (activeTab === "ranking") fetchLeaderboard();
  }, [activeTab]);

  const handleGameComplete = (score: number) => {
    setGlobalScore((prev) => prev + score);
  };

  const renderGameArea = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-container"
        style={{ textAlign: "left" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <button
            className="nav-tab"
            style={{ border: "1px solid var(--border-color)" }}
            onClick={() => setActiveGame("none")}
          >
            ← Volver al Menú
          </button>
          <motion.div
            key={globalScore}
            initial={{ scale: 1.5, color: "#fff" }}
            animate={{ scale: 1, color: "var(--accent-green)" }}
            style={{ fontWeight: "bold" }}
          >
            Acumulado: {globalScore} pts
          </motion.div>
        </div>

        {activeGame === "trivia" && (
          <TriviaGame
            onBack={() => setActiveGame("none")}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === "match" && (
          <MatchGame
            onBack={() => setActiveGame("none")}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === "timeline" && (
          <TimelineGame
            onBack={() => setActiveGame("none")}
            onComplete={handleGameComplete}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="logo-section">
          <div className="dots">
            <span className="dot red"></span>
            <span className="dot green"></span>
            <span className="dot blue"></span>
          </div>
          SEMICONDUCTORES
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "jugar" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("jugar");
              setActiveGame("none");
            }}
          >
            Jugar
          </button>
          <button
            className={`nav-tab ${activeTab === "ranking" ? "active" : ""}`}
            onClick={() => setActiveTab("ranking")}
          >
            Ranking
          </button>
          <button
            className={`nav-tab ${activeTab === "recursos" ? "active" : ""}`}
            onClick={() => setActiveTab("recursos")}
          >
            Recursos
          </button>
        </div>
      </nav>

      <main>
        {activeTab === "jugar" && activeGame === "none" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hero-section">
              <h1 className="hero-title">
                De la Física de Semiconductores a<br />
                la Revolución Lumínica
              </h1>
              <p className="hero-subtitle">
                Trivia y minijuegos sobre cómo un cristal, unos electrones y una
                banda prohibida cambiaron la forma de iluminar el mundo.
              </p>

              <div
                className="save-input-group"
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                  <input
                    type="text"
                    placeholder="Tu nombre para el ranking"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={15}
                  />
                  <button
                    className="btn-guardar"
                    onClick={saveScore}
                    disabled={
                      isSaving || globalScore === 0 || !playerName.trim()
                    }
                  >
                    {isSaving ? "Guardando..." : `Guardar ${globalScore} pts`}
                  </button>
                </div>
                {globalScore > 0 ? (
                  <button className="btn-compartir" onClick={compartirPuntaje}>
   Compartir mi puntaje 🚀
</button>
                ) : (
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    Jugá un minijuego primero para sumar puntos.
                  </span>
                )}
              </div>
            </div>

            <div className="games-grid">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="game-card"
                onClick={() => setActiveGame("trivia")}
              >
                <div className="game-icon">⚡</div>
                <h3>Trivia Led</h3>
                <p>8 preguntas contra reloj. Cuanto más rápido, más puntos.</p>
                <div className="game-score">Jugar →</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="game-card"
                onClick={() => setActiveGame("match")}
              >
                <div className="game-icon">🎨</div>
                <h3>Match de Bandgap</h3>
                <p>
                  Uní cada material semiconductor con el color de luz que emite.
                </p>
                <div className="game-score">Jugar →</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="game-card"
                onClick={() => setActiveGame("timeline")}
              >
                <div className="game-icon">⏳</div>
                <h3>Línea del Tiempo</h3>
                <p>
                  Ordená los hitos del LED, del más antiguo al más reciente.
                </p>
                <div className="game-score">Jugar →</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "jugar" && activeGame !== "none" && renderGameArea()}

        {activeTab === "ranking" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-container"
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "2rem",
              }}
            >
              🏆 Top 10 Semanal
            </h2>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>
                  Todavía no hay puntajes recientes.
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(148, 163, 184, 0.7)",
                  }}
                >
                  ¡Sé el primero en guardar un resultado!
                </p>
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 auto",
                  maxWidth: "500px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {leaderboard.map((entry, idx) => (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "1rem",
                      background:
                        idx === 0
                          ? "rgba(250, 204, 21, 0.1)"
                          : idx === 1
                            ? "rgba(148, 163, 184, 0.1)"
                            : idx === 2
                              ? "rgba(180, 83, 9, 0.1)"
                              : "rgba(255, 255, 255, 0.03)",
                      borderLeft: `4px solid ${idx === 0 ? "#facc15" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "transparent"}`,
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    <span>
                      {idx + 1}. {entry.name}
                    </span>
                    <span style={{ color: "var(--accent-blue)" }}>
                      {entry.score} pts
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {activeTab === "recursos" && <Recursos />}
      </main>
    </div>
  );
}

export default App;
