const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getUsuario = (request, response) => {
  pool.query("SELECT * FROM usuarios ORDER BY id ASC", (error, results) => {
    if (error) {
      return response.status(500).json({ error: error.message });
    }
    response.status(200).json(results.rows);
  });
};

const crearUsuario = (request, response) => {
  const { nombre, edad, tipo } = request.body;
  if (!nombre ||!edad ||!tipo) {
    return response.status(400).json({ error: "Faltan datos obligatorios" });
  }
  pool.query(
    "INSERT INTO usuarios (nombre, edad, tipo) VALUES ($1, $2, $3)",
    [nombre, edad, tipo],
    (error) => {
      if (error) return response.status(500).json({ error: error.message });
      response.status(201).json({ UsuarioAgregado: "Ok" });
    }
  );
};

const actualizarUsuario = (request, response) => {
  const id = parseInt(request.params.id);
  const { nombre, edad, tipo } = request.body;
  pool.query(
    'UPDATE usuarios SET nombre = $1, edad = $2, tipo = $3 WHERE id = $4 RETURNING *',
    [nombre, edad, tipo, id],
    (error, results) => {
      if (error) return response.status(500).json({ error: error.message });
      if (results.rows.length === 0) return response.status(404).json({ error: "No encontrado" });
      response.status(200).json(results.rows[0]);
    }
  );
};

const eliminarUsuario = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query('DELETE FROM usuarios WHERE id = $1', [id], (error, results) => {
    if (error) return response.status(500).json({ error: error.message });
    response.status(200).json({ mensaje: `Usuario ${id} eliminado` });
  });
};

app.get("/", (req, res) => {
  res.json({ Resultado: "Bienvenido al Taller Despliegue Rest - Railway" });
});

app.get("/usuarios", getUsuario);
app.post("/usuarios", crearUsuario);
app.put("/usuarios/:id", actualizarUsuario);
app.delete("/usuarios/:id", eliminarUsuario);

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log("El servidor está inicializado en http://localhost:%d", port);
});