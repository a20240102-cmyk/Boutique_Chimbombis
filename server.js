require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite peticiones desde tu frontend
app.use(express.json({ limit: '50mb' })); // Permite leer JSON grandes (para las imágenes)
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname))); // Permite ver la página web (index.html)

// Configuración de la base de datos
// Configuración protegida con variables de entorno
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 23332,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión inicial
db.getConnection((err, connection) => {
    if (err) return console.error('Error conectando a Aiven MySQL:', err);
    console.log('Conexión exitosa a Aiven MySQL');
    connection.release();
});

// Rutas de la API

// 1. Obtener todos los muebles (GET)
app.get('/api/muebles', (req, res) => {
    const sql = 'SELECT * FROM muebles ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 2. Obtener un mueble por ID (GET)
app.get('/api/muebles/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM muebles WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Mueble no encontrado' });
        }
        res.json(result[0]);
    });
});

// 3. Crear un nuevo mueble (POST)
app.post('/api/muebles', (req, res) => {
    const { nombre, descripcion, material, precio, stock, imagen } = req.body;
    
    // Validación básica
    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }

    const sql = 'INSERT INTO muebles (nombre, descripcion, material, precio, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, descripcion, material, precio, stock || 0, imagen], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Devolver el objeto creado con su nuevo ID
        res.status(201).json({
            id: result.insertId,
            nombre,
            descripcion,
            material,
            precio,
            stock: stock || 0,
            imagen
        });
    });
});

// 4. Actualizar un mueble existente (PUT)
app.put('/api/muebles/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, material, precio, stock, imagen } = req.body;

    const sql = 'UPDATE muebles SET nombre = ?, descripcion = ?, material = ?, precio = ?, stock = ?, imagen = ? WHERE id = ?';
    db.query(sql, [nombre, descripcion, material, precio, stock, imagen, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mueble no encontrado para actualizar' });
        }
        res.json({
            id,
            nombre,
            descripcion,
            material,
            precio,
            stock,
            imagen
        });
    });
});

// 5. Eliminar un mueble (DELETE)
app.delete('/api/muebles/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM muebles WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mueble no encontrado para eliminar' });
        }
        res.json({ message: 'Mueble eliminado correctamente' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});