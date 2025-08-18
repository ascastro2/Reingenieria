const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { conditionalAuth, requireRole } = require('./auth');

const router = express.Router();

router.use(conditionalAuth); // Aplicar autenticación condicional a todas las rutas

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await executeQuery(`
      SELECT 
        idCliente,
        Nombre_Cliente,
        Apellido_Cliente,
        razon_s_Cliente,
        ruc_Cliente,
        direccion_Cliente,
        telefono_Cliente,
        correo_Cliente,
        fecha_registro,
        estado
      FROM clientes 
      ORDER BY Nombre_Cliente, Apellido_Cliente
    `);

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los clientes'
    });
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE idCliente = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: clientes[0]
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el cliente'
    });
  }
});

// Crear nuevo cliente
router.post('/', [
  body('Nombre_Cliente')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('Apellido_Cliente')
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 100 }).withMessage('El apellido no puede exceder 100 caracteres'),
  body('razon_s_Cliente')
    .optional()
    .isLength({ max: 200 }).withMessage('La razón social no puede exceder 200 caracteres'),
  body('ruc_Cliente')
    .optional()
    .isLength({ max: 20 }).withMessage('El RUC no puede exceder 20 caracteres'),
  body('direccion_Cliente')
    .optional()
    .isString().withMessage('La dirección debe ser texto'),
  body('telefono_Cliente')
    .notEmpty().withMessage('El teléfono es requerido')
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('correo_Cliente')
    .optional()
    .isEmail().withMessage('El correo debe ser válido')
    .isLength({ max: 150 }).withMessage('El correo no puede exceder 150 caracteres'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
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

    const {
      Nombre_Cliente,
      Apellido_Cliente,
      razon_s_Cliente,
      ruc_Cliente,
      direccion_Cliente,
      telefono_Cliente,
      correo_Cliente,
      estado
    } = req.body;

    const result = await executeQuery(`
      INSERT INTO clientes (
        Nombre_Cliente, 
        Apellido_Cliente, 
        razon_s_Cliente, 
        ruc_Cliente, 
        direccion_Cliente, 
        telefono_Cliente, 
        correo_Cliente,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      Nombre_Cliente, 
      Apellido_Cliente, 
      razon_s_Cliente || null, 
      ruc_Cliente || null, 
      direccion_Cliente || null, 
      telefono_Cliente, 
      correo_Cliente || null,
      estado || 'activo'
    ]);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { idCliente: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el cliente'
    });
  }
});

// Actualizar cliente
router.put('/:id', [
  body('Nombre_Cliente')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('Apellido_Cliente')
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 100 }).withMessage('El apellido no puede exceder 100 caracteres'),
  body('razon_s_Cliente')
    .optional()
    .isLength({ max: 200 }).withMessage('La razón social no puede exceder 200 caracteres'),
  body('ruc_Cliente')
    .optional()
    .isLength({ max: 20 }).withMessage('El RUC no puede exceder 20 caracteres'),
  body('direccion_Cliente')
    .optional()
    .isString().withMessage('La dirección debe ser texto'),
  body('telefono_Cliente')
    .notEmpty().withMessage('El teléfono es requerido')
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('correo_Cliente')
    .optional()
    .isEmail().withMessage('El correo debe ser válido')
    .isLength({ max: 150 }).withMessage('El correo no puede exceder 150 caracteres'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
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
    const {
      Nombre_Cliente,
      Apellido_Cliente,
      razon_s_Cliente,
      ruc_Cliente,
      direccion_Cliente,
      telefono_Cliente,
      correo_Cliente,
      estado
    } = req.body;

    const result = await executeQuery(`
      UPDATE clientes SET 
        Nombre_Cliente = ?,
        Apellido_Cliente = ?,
        razon_s_Cliente = ?,
        ruc_Cliente = ?,
        direccion_Cliente = ?,
        telefono_Cliente = ?,
        correo_Cliente = ?,
        estado = ?
      WHERE idCliente = ?
    `, [
      Nombre_Cliente, 
      Apellido_Cliente, 
      razon_s_Cliente || null, 
      ruc_Cliente || null, 
      direccion_Cliente || null, 
      telefono_Cliente, 
      correo_Cliente || null,
      estado || 'activo',
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el cliente'
    });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el cliente tiene ventas asociadas
    const ventasCliente = await executeQuery(
      'SELECT COUNT(*) as total FROM ventas WHERE id_cliente = ?',
      [id]
    );

    if (ventasCliente[0].total > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el cliente porque tiene ventas asociadas'
      });
    }

    const result = await executeQuery(
      'DELETE FROM clientes WHERE idCliente = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el cliente'
    });
  }
});

// Buscar clientes por nombre, apellido o RUC
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;
    const clientes = await executeQuery(`
      SELECT 
        idCliente,
        Nombre_Cliente,
        Apellido_Cliente,
        razon_s_Cliente,
        ruc_Cliente,
        direccion_Cliente,
        telefono_Cliente,
        correo_Cliente,
        fecha_registro,
        estado
      FROM clientes 
      WHERE Nombre_Cliente LIKE ? OR Apellido_Cliente LIKE ? OR ruc_Cliente LIKE ? OR telefono_Cliente LIKE ?
      ORDER BY Nombre_Cliente, Apellido_Cliente
    `, [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`]);

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar clientes'
    });
  }
});

// Estadísticas de clientes
router.get('/estadisticas/overview', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_clientes,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as clientes_activos,
        COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as clientes_inactivos,
        COUNT(CASE WHEN correo_Cliente IS NOT NULL AND correo_Cliente != '' THEN 1 END) as con_correo,
        COUNT(CASE WHEN telefono_Cliente IS NOT NULL AND telefono_Cliente != '' THEN 1 END) as con_telefono,
        COUNT(CASE WHEN ruc_Cliente IS NOT NULL AND ruc_Cliente != '' THEN 1 END) as con_ruc,
        COUNT(CASE WHEN direccion_Cliente IS NOT NULL AND direccion_Cliente != '' THEN 1 END) as con_direccion
      FROM clientes
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

// Obtener clientes por estado
router.get('/estado/:estado', async (req, res) => {
  try {
    const { estado } = req.params;
    
    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado debe ser "activo" o "inactivo"'
      });
    }

    const clientes = await executeQuery(`
      SELECT 
        idCliente,
        Nombre_Cliente,
        Apellido_Cliente,
        razon_s_Cliente,
        ruc_Cliente,
        direccion_Cliente,
        telefono_Cliente,
        correo_Cliente,
        fecha_registro,
        estado
      FROM clientes 
      WHERE estado = ?
      ORDER BY Nombre_Cliente, Apellido_Cliente
    `, [estado]);

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes por estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes por estado'
    });
  }
});

module.exports = router;
