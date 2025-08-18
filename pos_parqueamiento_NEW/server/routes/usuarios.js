const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireRole } = require('./auth');

const router = express.Router();

// Middleware de autenticación condicional para desarrollo
const conditionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // En desarrollo, permitir acceso con token de desarrollo o sin autenticación
  if (process.env.NODE_ENV === 'development') {
    // Si hay token de desarrollo, simular usuario admin
    if (token && token.startsWith('dev_token_')) {
      req.user = {
        id_usuario: 1,
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@parqueamiento.com',
        rol: 'admin',
        estado: 'activo'
      };
      return next();
    }
    
    // Si no hay token, también permitir acceso (para desarrollo)
    req.user = {
      id_usuario: 1,
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@parqueamiento.com',
      rol: 'admin',
      estado: 'activo'
    };
    return next();
  }
  
  // En producción, requerir autenticación
  return authenticateToken(req, res, next);
};

router.use(conditionalAuth); // Aplicar autenticación condicional a todas las rutas

// Obtener todos los usuarios
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const usuarios = await executeQuery(`
      SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        rol,
        estado,
        fecha_creacion,
        ultimo_acceso
      FROM usuarios 
      ORDER BY nombre, apellido
    `);

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los usuarios'
    });
  }
});

// Obtener usuario por ID
router.get('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const usuarios = await executeQuery(
      'SELECT id_usuario, nombre, apellido, email, rol, estado, fecha_creacion, ultimo_acceso FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el usuario'
    });
  }
});

// Obtener perfil del usuario actual
router.get('/perfil/actual', async (req, res) => {
  try {
    const usuarios = await executeQuery(
      'SELECT id_usuario, nombre, apellido, email, rol, estado, fecha_creacion, ultimo_acceso FROM usuarios WHERE id_usuario = ?',
      [req.user.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil'
    });
  }
});

// Crear nuevo usuario
router.post('/', requireRole(['admin']), [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('El email debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').isIn(['admin', 'vendedor', 'cajero']).withMessage('Rol no válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { nombre, apellido, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await executeQuery(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const fecha_creacion = new Date();
    const result = await executeQuery(`
      INSERT INTO usuarios (
        nombre, 
        apellido, 
        email, 
        password, 
        rol, 
        estado, 
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, 'activo', ?)
    `, [nombre, apellido, email, hashedPassword, rol, fecha_creacion]);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { id_usuario: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el usuario'
    });
  }
});

// Actualizar usuario
router.put('/:id', requireRole(['admin']), [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('El email debe ser válido'),
  body('rol').isIn(['admin', 'vendedor', 'cajero']).withMessage('Rol no válido'),
  body('estado').isIn(['activo', 'inactivo']).withMessage('Estado no válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { nombre, apellido, email, rol, estado } = req.body;

    // Verificar si el email ya existe en otro usuario
    const usuarioExistente = await executeQuery(
      'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
      [email, id]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado por otro usuario'
      });
    }

    const result = await executeQuery(`
      UPDATE usuarios SET 
        nombre = ?,
        apellido = ?,
        email = ?,
        rol = ?,
        estado = ?
      WHERE id_usuario = ?
    `, [nombre, apellido, email, rol, estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el usuario'
    });
  }
});

// Actualizar perfil del usuario actual
router.put('/perfil/actual', [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('El email debe ser válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { nombre, apellido, email } = req.body;

    // Verificar si el email ya existe en otro usuario
    const usuarioExistente = await executeQuery(
      'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
      [email, req.user.id_usuario]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado por otro usuario'
      });
    }

    const result = await executeQuery(`
      UPDATE usuarios SET 
        nombre = ?,
        apellido = ?,
        email = ?
      WHERE id_usuario = ?
    `, [nombre, apellido, email, req.user.id_usuario]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el perfil'
    });
  }
});

// Cambiar contraseña
router.put('/:id/password', requireRole(['admin']), [
  body('password_nuevo').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { password_nuevo } = req.body;

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_nuevo, saltRounds);

    const result = await executeQuery(
      'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar la contraseña'
    });
  }
});

// Cambiar contraseña del usuario actual
router.put('/perfil/password', [
  body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('nueva_password').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { password_actual, nueva_password } = req.body;

    // Obtener usuario actual
    const usuarios = await executeQuery(
      'SELECT password FROM usuarios WHERE id_usuario = ?',
      [req.user.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(password_actual, usuarios[0].password);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nueva_password, saltRounds);

    await executeQuery(
      'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
      [hashedPassword, req.user.id_usuario]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar la contraseña'
    });
  }
});

// Eliminar usuario
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    const result = await executeQuery(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el usuario'
    });
  }
});

// Activar/Desactivar usuario
router.put('/:id/estado', requireRole(['admin']), [
  body('estado').isIn(['activo', 'inactivo']).withMessage('Estado no válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que no se desactive a sí mismo
    if (parseInt(id) === req.user.id && estado === 'inactivo') {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    const result = await executeQuery(
      'UPDATE usuarios SET estado = ? WHERE id_usuario = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar el estado del usuario'
    });
  }
});

// Buscar usuarios
router.get('/buscar/:termino', requireRole(['admin']), async (req, res) => {
  try {
    const { termino } = req.params;
    const usuarios = await executeQuery(`
      SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        rol,
        estado,
        fecha_creacion
      FROM usuarios 
      WHERE nombre LIKE ? OR apellido LIKE ? OR email LIKE ?
      ORDER BY nombre, apellido
    `, [`%${termino}%`, `%${termino}%`, `%${termino}%`]);

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar usuarios'
    });
  }
});

// Estadísticas de usuarios
router.get('/estadisticas/overview', requireRole(['admin']), async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as usuarios_activos,
        COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as usuarios_inactivos,
        COUNT(CASE WHEN rol = 'admin' THEN 1 END) as administradores,
        COUNT(CASE WHEN rol = 'vendedor' THEN 1 END) as vendedores,
        COUNT(CASE WHEN rol = 'cajero' THEN 1 END) as cajeros
      FROM usuarios
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
