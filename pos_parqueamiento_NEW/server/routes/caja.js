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

// Obtener todas las cajas
router.get('/', async (req, res) => {
  try {
    const cajas = await executeQuery(`
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM caja c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.fecha_apertura DESC, c.id_caja DESC
    `);

    res.json({
      success: true,
      data: cajas
    });
  } catch (error) {
    console.error('Error al obtener cajas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las cajas'
    });
  }
});

// Obtener caja por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cajas = await executeQuery(`
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM caja c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_caja = ?
    `, [id]);

    if (cajas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Caja no encontrada'
      });
    }

    res.json({
      success: true,
      data: cajas[0]
    });
  } catch (error) {
    console.error('Error al obtener caja:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la caja'
    });
  }
});

// Abrir caja
router.post('/abrir', [
  body('monto_inicial').isFloat({ min: 0 }).withMessage('El monto inicial debe ser un número positivo'),
  body('observaciones').optional().isString()
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

    // Verificar si ya hay una caja abierta
    const cajaAbierta = await executeQuery(
      'SELECT * FROM caja WHERE estado = "abierta" ORDER BY id_caja DESC LIMIT 1'
    );

    if (cajaAbierta.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una caja abierta'
      });
    }

    const { monto_inicial, observaciones } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const hora_apertura = new Date();

    const result = await executeQuery(`
      INSERT INTO caja (
        fecha_apertura, 
        monto_inicial, 
        estado, 
        id_usuario, 
        observaciones
      ) VALUES (?, ?, 'abierta', ?, ?)
    `, [hora_apertura, monto_inicial, req.user.id_usuario, observaciones]);

    res.status(201).json({
      success: true,
      message: 'Caja abierta exitosamente',
      data: { 
        id_caja: result.insertId,
        monto_inicial,
        hora_apertura
      }
    });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({
      success: false,
      error: 'Error al abrir la caja'
    });
  }
});

// Cerrar caja
router.put('/:id/cerrar', [
  body('monto_final').isFloat({ min: 0 }).withMessage('El monto final debe ser un número positivo'),
  body('observaciones').optional().isString()
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
    const { monto_final, observaciones } = req.body;

    // Obtener la caja
    const cajas = await executeQuery(
      'SELECT * FROM caja WHERE id_caja = ? AND estado = "abierta"',
      [id]
    );

    if (cajas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Caja abierta no encontrada'
      });
    }

    const caja = cajas[0];
    const hora_cierre = new Date();
    
    // Calcular totales de movimientos
    const movimientos = await executeQuery(`
      SELECT 
        SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo_movimiento IN ('egreso', 'retiro') THEN monto ELSE 0 END) as total_egresos
      FROM movimientos_caja 
      WHERE id_caja = ?
    `, [id]);
    
    const v_total_ventas = movimientos[0].total_ingresos || 0;
    const v_total_retiros = movimientos[0].total_egresos || 0;

    // Actualizar la caja
    await executeQuery(`
      UPDATE caja SET 
        estado = 'cerrada',
        fecha_cierre = ?,
        monto_final = ?,
        total_ventas = ?,
        total_retiros = ?
      WHERE id_caja = ?
    `, [hora_cierre, monto_final, v_total_ventas, v_total_retiros, id]);

    res.json({
      success: true,
      message: 'Caja cerrada exitosamente',
      data: {
        monto_final,
        total_ventas: v_total_ventas,
        total_retiros: v_total_retiros,
        hora_cierre
      }
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cerrar la caja'
    });
  }
});

// Obtener caja actual (abierta)
router.get('/actual/estado', async (req, res) => {
  try {
    const cajaActual = await executeQuery(`
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM caja c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.estado = "abierta"
      ORDER BY c.id_caja DESC
      LIMIT 1
    `);

    if (cajaActual.length === 0) {
      return res.json({
        success: true,
        data: { estado: 'cerrada' }
      });
    }

    // Calcular tiempo transcurrido
    const caja = cajaActual[0];
    const hora_apertura = new Date(caja.fecha_apertura);
    const ahora = new Date();
    const tiempo_transcurrido = Math.floor((ahora - hora_apertura) / (1000 * 60)); // en minutos

    // Calcular ventas asociadas a esta sesión de caja
    const ventas = await executeQuery(`
      SELECT 
        COUNT(*) as total_ventas,
        SUM(CASE WHEN estado = 'finalizada' THEN monto_total ELSE 0 END) as total_ventas_finalizadas,
        SUM(CASE WHEN estado = 'cancelada' THEN monto_total ELSE 0 END) as total_ventas_canceladas
      FROM ventas 
      WHERE fecha_venta >= ? AND fecha_venta <= ?
    `, [caja.fecha_apertura, ahora]);

    // Calcular movimientos de caja
    const movimientos = await executeQuery(`
      SELECT 
        SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo_movimiento IN ('egreso', 'retiro') THEN monto ELSE 0 END) as total_egresos
      FROM movimientos_caja 
      WHERE id_caja = ?
    `, [caja.id_caja]);

    const total_ingresos = movimientos[0]?.total_ingresos || 0;
    const total_egresos = movimientos[0]?.total_egresos || 0;
    const total_ventas_sesion = ventas[0]?.total_ventas_finalizadas || 0;
    
    // Calcular saldo actual: monto inicial + ventas + ingresos manuales - egresos
    const saldo_actual = caja.monto_inicial + total_ventas_sesion + total_ingresos - total_egresos;

    res.json({
      success: true,
      data: {
        ...caja,
        estado: 'abierta',
        tiempo_transcurrido,
        total_ventas: ventas[0]?.total_ventas || 0,
        total_ventas_finalizadas: total_ventas_sesion,
        total_ventas_canceladas: ventas[0]?.total_ventas_canceladas || 0,
        total_ingresos_manuales: total_ingresos,
        total_egresos: total_egresos,
        saldo_actual: saldo_actual
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de caja:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el estado de la caja'
    });
  }
});

// Agregar monto a caja abierta
router.put('/:id/agregar', [
  body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('concepto').notEmpty().withMessage('El concepto es requerido')
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
    const { monto, concepto } = req.body;

    // Verificar que la caja esté abierta
    const cajas = await executeQuery(
      'SELECT * FROM caja WHERE id_caja = ? AND estado = "abierta"',
      [id]
    );

    if (cajas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La caja debe estar abierta para agregar montos'
      });
    }

    const caja = cajas[0];
    // Calcular nuevo monto basado en movimientos
    const movimientos = await executeQuery(`
      SELECT 
        SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo_movimiento IN ('egreso', 'retiro') THEN monto ELSE 0 END) as total_egresos
      FROM movimientos_caja 
      WHERE id_caja = ?
    `, [id]);
    
    const monto_actual = caja.monto_inicial + (movimientos[0].total_ingresos || 0) - (movimientos[0].total_egresos || 0);
    const nuevo_monto = monto_actual + monto;

    // No necesitamos actualizar la tabla caja, solo registrar el movimiento
    // El monto se calcula dinámicamente desde movimientos_caja

    // Registrar el movimiento
    await executeQuery(`
      INSERT INTO movimientos_caja (
        id_caja,
        tipo_movimiento,
        monto,
        descripcion,
        id_usuario
      ) VALUES (?, 'ingreso', ?, ?, ?)
    `, [id, monto, concepto, req.user.id_usuario]);

    res.json({
      success: true,
      message: 'Monto agregado exitosamente',
      data: {
        monto_anterior: monto_actual,
        monto_agregado: monto,
        nuevo_monto: nuevo_monto
      }
    });
  } catch (error) {
    console.error('Error al agregar monto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar el monto'
    });
  }
});

// Retirar monto de caja abierta
router.put('/:id/retirar', [
  body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('concepto').notEmpty().withMessage('El concepto es requerido')
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
    const { monto, concepto } = req.body;

    // Verificar que la caja esté abierta
    const cajas = await executeQuery(
      'SELECT * FROM caja WHERE id_caja = ? AND estado = "abierta"',
      [id]
    );

    if (cajas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La caja debe estar abierta para retirar montos'
      });
    }

    const caja = cajas[0];
    
    // Calcular monto actual basado en movimientos
    const movimientos = await executeQuery(`
      SELECT 
        SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo_movimiento IN ('egreso', 'retiro') THEN monto ELSE 0 END) as total_egresos
      FROM movimientos_caja 
      WHERE id_caja = ?
    `, [id]);
    
    const monto_actual = caja.monto_inicial + (movimientos[0].total_ingresos || 0) - (movimientos[0].total_egresos || 0);
    
    if (monto_actual < monto) {
      return res.status(400).json({
        success: false,
        error: 'No hay suficiente dinero en caja para este retiro'
      });
    }

    const nuevo_monto = monto_actual - monto;

    // No necesitamos actualizar la tabla caja, solo registrar el movimiento
    // El monto se calcula dinámicamente desde movimientos_caja

    // Registrar el movimiento
    await executeQuery(`
      INSERT INTO movimientos_caja (
        id_caja,
        tipo_movimiento,
        monto,
        descripcion,
        id_usuario
      ) VALUES (?, 'retiro', ?, ?, ?)
    `, [id, monto, concepto, req.user.id_usuario]);

    res.json({
      success: true,
      message: 'Monto retirado exitosamente',
      data: {
        monto_anterior: monto_actual,
        monto_retirado: monto,
        nuevo_monto: nuevo_monto
      }
    });
  } catch (error) {
    console.error('Error al retirar monto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al retirar el monto'
    });
  }
});

// Obtener movimientos de caja
router.get('/:id/movimientos', async (req, res) => {
  try {
    const { id } = req.params;
    const movimientos = await executeQuery(`
      SELECT 
        m.*,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM movimientos_caja m
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
      WHERE m.id_caja = ?
      ORDER BY m.fecha_movimiento DESC
    `, [id]);

    res.json({
      success: true,
      data: movimientos
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los movimientos'
    });
  }
});

// Estadísticas de caja
router.get('/estadisticas/overview', async (req, res) => {
  try {
    // Obtener estadísticas básicas de caja
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_cajas,
        COUNT(CASE WHEN estado = 'abierta' THEN 1 END) as cajas_abiertas,
        COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cajas_cerradas,
        SUM(CASE WHEN estado = 'cerrada' THEN monto ELSE 0 END) as total_cerrado,
        AVG(CASE WHEN estado = 'cerrada' THEN monto ELSE NULL END) as promedio_cierre
      FROM caja
    `);

    // Obtener total de ventas del día
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = await executeQuery(`
      SELECT 
        COUNT(*) as total_ventas_hoy,
        SUM(CASE WHEN estado = 'finalizada' THEN monto_total ELSE 0 END) as total_ventas_finalizadas_hoy
      FROM ventas 
      WHERE DATE(fecha_venta) = ?
    `, [hoy]);

    // Combinar estadísticas
    const estadisticasCompletas = {
      ...stats[0],
      total_ventas_hoy: ventasHoy[0]?.total_ventas_hoy || 0,
      total_ventas_finalizadas_hoy: ventasHoy[0]?.total_ventas_finalizadas_hoy || 0
    };

    res.json({
      success: true,
      data: estadisticasCompletas
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
