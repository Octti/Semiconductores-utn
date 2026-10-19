import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminPanel() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [scores, setScores] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scores`);
      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchScores();
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token); // Guardamos la sesión
        setError('');
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que querés borrar este puntaje?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/scores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setScores(scores.filter(s => s.id !== id)); // Lo borramos visualmente al instante
      } else {
        if (res.status === 403) {
          setError('Sesión expirada. Volvé a ingresar.');
          handleLogout();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel-container" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2>Acceso Restringido 🔒</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Panel exclusivo para administradores.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <button className="btn-guardar" onClick={handleLogin}>Ingresar</button>
          {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Panel de Control ⚙️</h2>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cerrar Sesión</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {scores.map((entry, idx) => (
          <li key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div>
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{idx + 1}. {entry.name}</span>
              <span style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{entry.score} pts</span>
            </div>
            <button 
              onClick={() => handleDelete(entry.id)} 
              style={{ background: 'var(--accent-red)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}