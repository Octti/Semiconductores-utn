import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';

const app = express();
// Render asigna el puerto automáticamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Conexión a Turso (SQLite en la Nube)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

// 2. Inicializar tabla
db.execute(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).then(() => console.log('Tabla scores conectada en Turso'))
  .catch(err => console.error('Error creando tabla:', err));

// 3. Endpoints
app.post('/api/scores', async (req: Request, res: Response): Promise<any> => {
    let { name, score } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nombre inválido' });
    }
    if (score === undefined || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Puntaje inválido' });
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
        const result = await db.execute('SELECT name, score FROM scores ORDER BY score DESC, date DESC LIMIT 10');
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});