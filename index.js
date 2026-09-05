require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN QUE CORRIGE EL AggregateError
// Si es conexión interna de Railway usa false, si es externa (localhost) usa ssl true
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal')
   ? false
    : { rejectUnauthorized: false }
});

// Ruta Raíz
app.get('/', (req, res) => {
  res.json({ Resultado: "Bienvenido al Taller Despliegue Rest - Railway" });
});

// GET - Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, detail: error.toString() });
  }
});

// POST - Crear usuario
app.post('/usuarios', async (req, res) => {
  try {
    const { nombre, edad, tipo } = req.body;
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, edad, tipo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, edad, tipo]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar usuario
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});