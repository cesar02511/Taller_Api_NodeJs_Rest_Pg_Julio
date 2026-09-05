require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const app = express()

app.use(express.json())

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

const getUsuarios = (req, res) => {
  pool.query('SELECT * FROM usuarios ORDER BY id ASC', (err, results) => {
    if (err) { console.log(err); return res.status(500).json({error: err.message}) }
    res.status(200).json(results.rows)
  })
}

const getUsuario = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('SELECT * FROM usuarios WHERE id=$1', [id], (err, results) => {
    if (err) { console.log(err); return res.status(500).json({error: err.message}) }
    res.status(200).json(results.rows)
  })
}

const crearUsuario = (req, res) => {
  const { nombre, edad, tipo } = req.body
  pool.query('INSERT INTO usuarios (nombre, edad, tipo) VALUES ($1, $2, $3) RETURNING *', [nombre, edad, tipo], (err, results) => {
    if (err) { console.log(err); return res.status(500).json({error: err.message}) }
    res.status(201).json({UsuarioCreado: results.rows[0]})
  })
}

const actualizarUsuario = (req, res) => {
  const id = parseInt(req.params.id)
  const { nombre, edad, tipo } = req.body
  pool.query('UPDATE usuarios SET nombre=$1, edad=$2, tipo=$3 WHERE id=$4', [nombre, edad, tipo, id], (err) => {
    if (err) { console.log(err); return res.status(500).json({error: err.message}) }
    res.status(200).json({UsuarioActualizado: "Ok"})
  })
}

const eliminarUsuario = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('DELETE FROM usuarios WHERE id=$1', [id], (err) => {
    if (err) { console.log(err); return res.status(500).json({error: err.message}) }
    res.status(200).json({UsuarioEliminado: "Ok"})
  })
}

app.get('/', (req, res) => res.json({ Resultado: 'Bienvenido al Taller Despliegue Rest - Railway' }))
app.get('/usuarios', getUsuarios)
app.get('/usuarios/:id', getUsuario)
app.post('/usuarios', crearUsuario)
app.put('/usuarios/:id', actualizarUsuario)
app.delete('/usuarios/:id', eliminarUsuario)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`API en http://localhost:${port} - BD ${process.env.DB_NAME} puerto ${process.env.DB_PORT}`)
})