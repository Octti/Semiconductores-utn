import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

// Variables de entorno para seguridad
const JWT_SECRET = process.env.JWT_SECRET || 'ClaveSecretaDeDesarrollo';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Contraseña por defecto

app.use(cors());
app.use(express.json());

const scoreLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5,
    message: { error: 'Demasiados intentos. Por favor esperá un minuto.' }
});

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
`).then(() => console.log('Tabla scores conectada')).catch(err => console.error(err));

const malasPalabras = ['boludo', 'puto', 'mierda', 'idiota', 'forro', 'caca', 'pija', 'concha', 'culo'];

// --- NUEVO: SISTEMA DE AUTENTICACIÓN ---

// 1. Endpoint de Login
app.post('/api/login', (req: Request, res: Response): any => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        // Si la clave es correcta, generamos una credencial (token) válida por 2 horas
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token });
    }
    return res.status(401).json({ error: 'Contraseña incorrecta' });
});

// 2. Middleware de protección (Guardián)
const verificarToken = (req: Request, res: Response, next: NextFunction): any => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El formato es "Bearer <token>"
    
    if (!token) return res.status(403).json({ error: 'Acceso denegado. Se requiere token.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
        next(); // Si el token es válido, lo dejamos pasar a la ruta de borrado
    });
};

// 3. Endpoint Protegido: Borrar puntaje
// 3. Endpoint Protegido: Borrar puntaje
app.delete('/api/scores/:id', verificarToken, async (req: Request, res: Response): Promise<any> => {
    // Convertimos el ID explícitamente a número para que TypeScript y Turso no se quejen
    const scoreId = Number(req.params.id);

    if (isNaN(scoreId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        await db.execute({
            sql: 'DELETE FROM scores WHERE id = ?',
            args: [scoreId] // Ahora TypeScript sabe que esto es 100% un 'number'
        });
        res.json({ message: 'Puntaje eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el puntaje' });
    }
});

// --- FIN NUEVO SISTEMA ---

app.post('/api/scores', scoreLimiter, async (req: Request, res: Response): Promise<any> => {
    let { name, score } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') return res.status(400).json({ error: 'Nombre inválido' });
    if (score === undefined || typeof score !== 'number' || score < 0) return res.status(400).json({ error: 'Puntaje inválido' });

    const isProfane = malasPalabras.some(word => name.toLowerCase().includes(word));
    if (isProfane) return res.status(400).json({ error: 'Por favor, usá un nombre más amigable.' });

    name = name.trim().substring(0, 15);

    try {
        const result = await db.execute({
            sql: 'INSERT INTO scores (name, score) VALUES (?, ?)',
            args: [name as string, score as number] // <-- ACÁ ESTÁ LA MAGIA
        });
        res.json({ id: result.lastInsertRowid, name, score });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/scores', async (req: Request, res: Response): Promise<any> => {
    try {
        // Modificamos el SELECT para que también traiga el 'id', necesario para borrar
        const sql = `SELECT id, name, score FROM scores WHERE date >= datetime('now', '-7 days') ORDER BY score DESC, date DESC LIMIT 50`;
        const result = await db.execute(sql);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));