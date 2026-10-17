import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Inicializar SQLite con soporte para alta concurrencia
const db = new sqlite3.Database('./leaderboard.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Habilitar Write-Ahead Logging para soportar múltiples lecturas/escrituras simultáneas
        db.run('PRAGMA journal_mode = WAL;');
    }
});

// Crear tabla si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Endpoint para guardar un resultado
app.post('/api/scores', (req: Request, res: Response): any => {
    let { name, score } = req.body;
    
    // 1. Validación estricta
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nombre inválido o requerido' });
    }
    if (score === undefined || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Puntaje inválido o requerido' });
    }

    // 2. Sanitización (limita a 15 caracteres y quita espacios extra)
    name = name.trim().substring(0, 15);

    const sql = 'INSERT INTO scores (name, score) VALUES (?, ?)';
    
    // 3. Tipado explícito de 'this' para evitar errores de TypeScript
    db.run(sql, [name, score], function (this: sqlite3.RunResult, err: Error | null) {
        if (err) {
            console.error('Error insertando puntaje:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ id: this.lastID, name, score });
    });
});

// Endpoint para obtener el ranking (Top 10)
app.get('/api/scores', (req: Request, res: Response): any => {
    const sql = 'SELECT name, score FROM scores ORDER BY score DESC, date DESC LIMIT 10';
    db.all(sql, [], (err: Error | null, rows: any[]) => {
        if (err) {
            console.error('Error obteniendo ranking:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
});

// Cierre seguro de la base de datos al apagar el servidor
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('\nConexión a la base de datos cerrada de forma segura.');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});