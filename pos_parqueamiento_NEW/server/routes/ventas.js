const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery, executeTransaction } = require('../config/database');
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

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await executeQuery(`
      SELECT 
        v.id_venta,
        v.fecha_venta,
        v.hora_entrada,
        v.hora_salida,
        v.tiempo_total,
        v.tarifa_hora,
        v.monto_total,
        v.estado,
        v.id_cliente,
        v.id_espacio,
        v.id_usuario,
        v.placa_vehiculo,
        v.tipo_vehiculo,
        v.observaciones,
        c.Nombre_Cliente,
        c.Apellido_Cliente,
        c.ruc_Cliente,
        e.numero_espacio,
        u.nombre as nombre_usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.idCliente
      LEFT JOIN espacios e ON v.id_espacio = e.id_espacio
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha_venta DESC, v.hora_entrada DESC
    `);

    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las ventas'
    });
  }
});

// Obtener venta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ventas = await executeQuery(`
      SELECT 
        v.id_venta,
        v.fecha_venta,
        v.hora_entrada,
        v.hora_salida,
        v.tiempo_total,
        v.tarifa_hora,
        v.monto_total,
        v.estado,
        v.id_cliente,
        v.id_espacio,
        v.id_usuario,
        v.placa_vehiculo,
        v.tipo_vehiculo,
        v.observaciones,
        v.observaciones_salida,
        v.motivo_cancelacion,
        c.Nombre_Cliente,
        c.Apellido_Cliente,
        c.ruc_Cliente,
        e.numero_espacio,
        u.nombre as nombre_usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.idCliente
      LEFT JOIN espacios e ON v.id_espacio = e.id_espacio
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.id_venta = ?
    `, [id]);

    if (ventas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: ventas[0]
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la venta'
    });
  }
});

// Crear nueva venta (entrada de vehículo)
router.post('/', [
  body('id_espacio').isInt().withMessage('ID de espacio es requerido'),
  body('id_cliente').optional().isInt(),
  body('placa_vehiculo').notEmpty().withMessage('La placa del vehículo es requerida'),
  body('tipo_vehiculo').notEmpty().withMessage('El tipo de vehículo es requerido')
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
      id_espacio,
      id_cliente,
      placa_vehiculo,
      tipo_vehiculo,
      observaciones
    } = req.body;

    // Verificar que el espacio esté libre
    const espacio = await executeQuery(
      'SELECT * FROM espacios WHERE id_espacio = ? AND estado = "libre"',
      [id_espacio]
    );

    if (espacio.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El espacio no está disponible'
      });
    }

    // Obtener tarifa del espacio
    const tarifa = espacio[0].tarifa_hora;
    const hora_entrada = new Date();
    const fecha_venta = hora_entrada.toISOString().split('T')[0];

    // Crear la venta
    const result = await executeQuery(`
      INSERT INTO ventas (
        fecha_venta, 
        hora_entrada, 
        id_cliente, 
        id_espacio, 
        id_usuario, 
        placa_vehiculo, 
        tipo_vehiculo, 
        tarifa_hora, 
        estado, 
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activa', ?)
    `, [fecha_venta, hora_entrada, id_cliente, id_espacio, req.user.id_usuario, placa_vehiculo, tipo_vehiculo, tarifa, observaciones]);

    // Actualizar estado del espacio a ocupado
    await executeQuery(
      'UPDATE espacios SET estado = "ocupado" WHERE id_espacio = ?',
      [id_espacio]
    );

    res.status(201).json({
      success: true,
      message: 'Venta iniciada exitosamente',
      data: { 
        id_venta: result.insertId,
        hora_entrada,
        tarifa_hora: tarifa
      }
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la venta'
    });
  }
});

// Finalizar venta (salida de vehículo)
router.put('/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones_salida } = req.body;

    // Obtener la venta
    const ventas = await executeQuery(
      'SELECT * FROM ventas WHERE id_venta = ? AND estado = "activa"',
      [id]
    );

    if (ventas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venta activa no encontrada'
      });
    }

    const venta = ventas[0];
    const hora_salida = new Date();
    const hora_entrada = new Date(venta.hora_entrada);
    
    // Calcular tiempo total en minutos
    const tiempo_total = Math.ceil((hora_salida - hora_entrada) / (1000 * 60));
    const horas = Math.ceil(tiempo_total / 60);
    
    // Calcular monto total
    const monto_total = horas * venta.tarifa_hora;

    // Actualizar la venta
    await executeQuery(`
      UPDATE ventas SET 
        hora_salida = ?,
        tiempo_total = ?,
        monto_total = ?,
        estado = 'finalizada',
        observaciones_salida = ?
      WHERE id_venta = ?
    `, [hora_salida, tiempo_total, monto_total, observaciones_salida, id]);

    // Liberar el espacio
    await executeQuery(
      'UPDATE espacios SET estado = "libre" WHERE id_espacio = ?',
      [venta.id_espacio]
    );

    res.json({
      success: true,
      message: 'Venta finalizada exitosamente',
      data: {
        tiempo_total,
        monto_total,
        horas
      }
    });
  } catch (error) {
    console.error('Error al finalizar venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al finalizar la venta'
    });
  }
});

// Cancelar venta
router.put('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cancelacion } = req.body;

    // Obtener la venta
    const ventas = await executeQuery(
      'SELECT * FROM ventas WHERE id_venta = ? AND estado = "activa"',
      [id]
    );

    if (ventas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venta activa no encontrada'
      });
    }

    const venta = ventas[0];

    // Actualizar la venta
    await executeQuery(`
      UPDATE ventas SET 
        estado = 'cancelada',
        motivo_cancelacion = ?
      WHERE id_venta = ?
    `, [motivo_cancelacion, id]);

    // Liberar el espacio
    await executeQuery(
      'UPDATE espacios SET estado = "libre" WHERE id_espacio = ?',
      [venta.id_espacio]
    );

    res.json({
      success: true,
      message: 'Venta cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar la venta'
    });
  }
});

// Obtener ventas por fecha
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const ventas = await executeQuery(`
      SELECT 
        v.*,
        c.Nombre_Cliente,
        c.Apellido_Cliente,
        e.numero_espacio
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.idCliente
      LEFT JOIN espacios e ON v.id_espacio = e.id_espacio
      WHERE v.fecha_venta = ?
      ORDER BY v.hora_entrada DESC
    `, [fecha]);

    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    console.error('Error al obtener ventas por fecha:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las ventas'
    });
  }
});

// Estadísticas de ventas
router.get('/estadisticas/overview', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_ventas,
        COUNT(CASE WHEN estado = 'activa' THEN 1 END) as ventas_activas,
        COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as ventas_finalizadas,
        SUM(CASE WHEN estado = 'finalizada' THEN monto_total ELSE 0 END) as ingresos_totales,
        AVG(CASE WHEN estado = 'finalizada' THEN monto_total ELSE NULL END) as promedio_venta
      FROM ventas
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

// Ingresos por período
router.get('/ingresos/:periodo', async (req, res) => {
  try {
    const { periodo } = req.params;
    let query = '';
    let params = [];

    switch (periodo) {
      case 'hoy':
        query = 'SELECT SUM(monto_total) as total FROM ventas WHERE fecha_venta = CURDATE() AND estado = "finalizada"';
        break;
      case 'mes':
        query = 'SELECT SUM(monto_total) as total FROM ventas WHERE MONTH(fecha_venta) = MONTH(CURDATE()) AND YEAR(fecha_venta) = YEAR(CURDATE()) AND estado = "finalizada"';
        break;
      case 'semana':
        query = 'SELECT SUM(monto_total) as total FROM ventas WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND estado = "finalizada"';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Período no válido. Use: hoy, mes, semana'
        });
    }

    const result = await executeQuery(query, params);
    const total = result[0].total || 0;

    res.json({
      success: true,
      data: { total, periodo }
    });
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener ingresos'
    });
  }
});

module.exports = router;
