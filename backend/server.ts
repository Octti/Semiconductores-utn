import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import rateLimit from 'express-rate-limit'; // <-- LIBRERÍA NUEVA

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Limite de petición Anti-Bots (Máximo 5 envíos de puntaje por minuto)
const scoreLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5,
    message: { error: 'Demasiados intentos. Por favor esperá un minuto.' }
});

// 2. Conexión a Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

db.execute(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).then(() => console.log('Tabla scores conectada en Turso'))
  .catch(err => console.error('Error creando tabla:', err));

// 3. Diccionario básico anti-trolls
const malasPalabras = ['boludo', 'puto', 'mierda', 'idiota', 'forro', 'caca', 'pija', 'concha', 'culo', "culeado", "culeada"];

// 4. Endpoints
app.post('/api/scores', scoreLimiter, async (req: Request, res: Response): Promise<any> => {
    let { name, score } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nombre inválido' });
    }
    if (score === undefined || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Puntaje inválido' });
    }

    // Filtro de groserías en acción
    const isProfane = malasPalabras.some(word => name.toLowerCase().includes(word));
    if (isProfane) {
        return res.status(400).json({ error: 'Por favor, usá un nombre más amigable.' });
    }

    name = name.trim().substring(0, 15);

    try {
        const result = await db.execute({
            sql: 'INSERT INTO scores (name, score) VALUES (?, ?)',
            args: [name, score]
        });
        res.json({ id: result.lastInsertRowid, name, score });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/scores', async (req: Request, res: Response): Promise<any> => {
    try {
        // RANKING DE LOS ÚLTIMOS 7 DÍAS
        const sql = `
            SELECT name, score 
            FROM scores 
            WHERE date >= datetime('now', '-7 days')
            ORDER BY score DESC, date DESC 
            LIMIT 10
        `;
        const result = await db.execute(sql);
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});