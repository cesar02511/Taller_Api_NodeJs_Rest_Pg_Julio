require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// ESTA CONFIGURACIÓN ARREGLA EL AggregateError
// Si existe DATABASE_URL (Railway) la usa, si no, usa tu Postgres local
const pool = process.env.DATABASE_URL
 ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

app.get('/', (req, res) => {
  res.json({ Resultado: "Bienvenido al Taller Despliegue Rest - Railway" });
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error("ERROR REAL EN CONSOLA:", error);
    res.status(500).json({ error: error.message, detail: error.toString() });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const { nombre, edad, tipo } = req.body;
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, edad, tipo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, edad, tipo]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad, tipo } = req.body;
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, edad=$2, tipo=$3 WHERE id=$4 RETURNING *',
      [nombre, edad, tipo, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Conectado a: ${process.env.DATABASE_URL? 'RAILWAY' : process.env.DB_NAME + ' LOCAL'}`);
});