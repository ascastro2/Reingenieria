const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Middleware para validar JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Verificar que el usuario existe y está activo
    const [user] = await executeQuery(
      'SELECT id_usuario, nombre_usuario, apellido_usuario, email, rol, estado FROM usuarios WHERE id_usuario = ? AND estado = "activo"',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar rol
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Rol insuficiente.' });
    }

    next();
  };
};

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const [user] = await executeQuery(
      'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    await executeQuery(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?',
      [user.id_usuario]
    );

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, ip_usuario) VALUES (?, ?, ?, ?)',
      [user.id_usuario, 'login', 'usuarios', req.ip]
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre_usuario,
        apellido: user.apellido_usuario,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register (solo admin)
router.post('/register', authenticateToken, requireRole(['admin']), [
  body('nombre_usuario').trim().isLength({ min: 2, max: 50 }),
  body('apellido_usuario').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('rol').isIn(['admin', 'vendedor', 'cajero'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre_usuario, apellido_usuario, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const [existingUser] = await executeQuery(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const result = await executeQuery(
      'INSERT INTO usuarios (nombre_usuario, apellido_usuario, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre_usuario, apellido_usuario, email, hashedPassword, rol]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_nuevos, ip_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id_usuario,
        'crear_usuario',
        'usuarios',
        result.insertId,
        JSON.stringify({ nombre_usuario, apellido_usuario, email, rol }),
        req.ip
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id_usuario;

    // Obtener usuario actual
    const [user] = await executeQuery(
      'SELECT password FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await executeQuery(
      'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
      [hashedNewPassword, userId]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, ip_usuario) VALUES (?, ?, ?, ?, ?)',
      [userId, 'cambiar_password', 'usuarios', userId, req.ip]
    );

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;

    const [user] = await executeQuery(
      'SELECT id_usuario, nombre_usuario, apellido_usuario, email, rol, estado, fecha_creacion, ultimo_acceso FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, ip_usuario) VALUES (?, ?, ?, ?)',
      [userId, 'logout', 'usuarios', req.ip]
    );

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

module.exports = {
  router,
  authenticateToken,
  requireRole
};
