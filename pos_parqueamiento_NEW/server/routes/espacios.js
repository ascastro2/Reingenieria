const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { conditionalAuth } = require('./auth');

const router = express.Router();

// Aplicar middleware de autenticación condicional a todas las rutas
router.use(conditionalAuth);

// GET /api/espacios - Obtener todos los espacios
router.get('/', async (req, res) => {
  try {
    const espacios = await executeQuery(
      'SELECT * FROM espacios ORDER BY numero_espacio'
    );

    res.json({
      success: true,
      data: espacios
    });

  } catch (error) {
    console.error('Error al obtener espacios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/espacios/libres - Obtener espacios libres
router.get('/libres', async (req, res) => {
  try {
    const espaciosLibres = await executeQuery(
      'SELECT * FROM espacios WHERE estado = "libre" ORDER BY numero_espacio'
    );

    res.json({
      success: true,
      data: espaciosLibres
    });

  } catch (error) {
    console.error('Error al obtener espacios libres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/espacios/ocupados - Obtener espacios ocupados con detalles
router.get('/ocupados', async (req, res) => {
  try {
    const espaciosOcupados = await executeQuery(`
      SELECT 
        e.id_espacio,
        e.numero_espacio,
        e.tipo_vehiculo,
        e.tarifa_hora,
        v.placa_vehiculo,
        v.hora_entrada,
        TIMESTAMPDIFF(MINUTE, v.hora_entrada, NOW()) as minutos_estacionado,
        ROUND((TIMESTAMPDIFF(MINUTE, v.hora_entrada, NOW()) / 60) * e.tarifa_hora, 2) as monto_actual,
        c.Nombre_Cliente,
        c.Apellido_Cliente
      FROM espacios e
      JOIN ventas v ON e.id_espacio = v.id_espacio
      LEFT JOIN clientes c ON v.id_cliente = c.idCliente
      WHERE v.estado = 'activa'
      ORDER BY e.numero_espacio
    `);

    res.json({
      success: true,
      data: espaciosOcupados
    });

  } catch (error) {
    console.error('Error al obtener espacios ocupados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/espacios/:id - Obtener espacio específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [espacio] = await executeQuery(
      'SELECT * FROM espacios WHERE id_espacio = ?',
      [id]
    );

    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json({
      success: true,
      data: espacio
    });

  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/espacios - Crear nuevo espacio (solo admin)
router.post('/', [
  body('numero_espacio').trim().isLength({ min: 1, max: 10 }),
  body('tipo_vehiculo').isIn(['auto', 'camioneta', 'camion', 'moto']),
  body('tarifa_hora').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { numero_espacio, tipo_vehiculo, tarifa_hora } = req.body;

    // Verificar si el número de espacio ya existe
    const [existingEspacio] = await executeQuery(
      'SELECT id_espacio FROM espacios WHERE numero_espacio = ?',
      [numero_espacio]
    );

    if (existingEspacio) {
      return res.status(400).json({ error: 'El número de espacio ya existe' });
    }

    // Crear espacio
    const result = await executeQuery(
      'INSERT INTO espacios (numero_espacio, tipo_vehiculo, tarifa_hora) VALUES (?, ?, ?)',
      [numero_espacio, tipo_vehiculo, tarifa_hora]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_nuevos, ip_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id_usuario,
        'crear_espacio',
        'espacios',
        result.insertId,
        JSON.stringify({ numero_espacio, tipo_vehiculo, tarifa_hora }),
        req.ip
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Espacio creado exitosamente',
      data: {
        id_espacio: result.insertId,
        numero_espacio,
        tipo_vehiculo,
        tarifa_hora,
        estado: 'libre'
      }
    });

  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/espacios/:id - Actualizar espacio (solo admin)
router.put('/:id', [
  body('numero_espacio').trim().isLength({ min: 1, max: 10 }),
  body('tipo_vehiculo').isIn(['auto', 'camioneta', 'camion', 'moto']),
  body('tarifa_hora').isFloat({ min: 0.01 }),
  body('estado').isIn(['libre', 'ocupado', 'reservado', 'mantenimiento'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { numero_espacio, tipo_vehiculo, tarifa_hora, estado } = req.body;

    // Verificar si el espacio existe
    const [existingEspacio] = await executeQuery(
      'SELECT * FROM espacios WHERE id_espacio = ?',
      [id]
    );

    if (!existingEspacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Verificar si el nuevo número de espacio ya existe (excluyendo el actual)
    if (numero_espacio !== existingEspacio.numero_espacio) {
      const [duplicateEspacio] = await executeQuery(
        'SELECT id_espacio FROM espacios WHERE numero_espacio = ? AND id_espacio != ?',
        [numero_espacio, id]
      );

      if (duplicateEspacio) {
        return res.status(400).json({ error: 'El número de espacio ya existe' });
      }
    }

    // Obtener datos anteriores para el log
    const datosAnteriores = {
      numero_espacio: existingEspacio.numero_espacio,
      tipo_vehiculo: existingEspacio.tipo_vehiculo,
      tarifa_hora: existingEspacio.tarifa_hora,
      estado: existingEspacio.estado
    };

    // Actualizar espacio
    await executeQuery(
      'UPDATE espacios SET numero_espacio = ?, tipo_vehiculo = ?, tarifa_hora = ?, estado = ? WHERE id_espacio = ?',
      [numero_espacio, tipo_vehiculo, tarifa_hora, estado, id]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_anteriores, datos_nuevos, ip_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id_usuario,
        'actualizar_espacio',
        'espacios',
        id,
        JSON.stringify(datosAnteriores),
        JSON.stringify({ numero_espacio, tipo_vehiculo, tarifa_hora, estado }),
        req.ip
      ]
    );

    res.json({
      success: true,
      message: 'Espacio actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar espacio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/espacios/:id - Eliminar espacio (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el espacio existe
    const [espacio] = await executeQuery(
      'SELECT * FROM espacios WHERE id_espacio = ?',
      [id]
    );

    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Verificar si el espacio está ocupado
    const [ventaActiva] = await executeQuery(
      'SELECT id_venta FROM ventas WHERE id_espacio = ? AND estado = "activa"',
      [id]
    );

    if (ventaActiva) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un espacio que está ocupado' 
      });
    }

    // Eliminar espacio
    await executeQuery(
      'DELETE FROM espacios WHERE id_espacio = ?',
      [id]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_anteriores, ip_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id_usuario,
        'eliminar_espacio',
        'espacios',
        id,
        JSON.stringify(espacio),
        req.ip
      ]
    );

    res.json({
      success: true,
      message: 'Espacio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/espacios/:id/estado - Cambiar estado del espacio
router.post('/:id/estado', [
  body('estado').isIn(['libre', 'ocupado', 'reservado', 'mantenimiento'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { estado } = req.body;

    // Verificar si el espacio existe
    const [espacio] = await executeQuery(
      'SELECT * FROM espacios WHERE id_espacio = ?',
      [id]
    );

    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Verificar si se puede cambiar el estado
    if (estado === 'libre' && espacio.estado === 'ocupado') {
      const [ventaActiva] = await executeQuery(
        'SELECT id_venta FROM ventas WHERE id_espacio = ? AND estado = "activa"',
        [id]
      );

      if (ventaActiva) {
        return res.status(400).json({ 
          error: 'No se puede liberar un espacio que tiene una venta activa' 
        });
      }
    }

    // Actualizar estado
    await executeQuery(
      'UPDATE espacios SET estado = ? WHERE id_espacio = ?',
      [estado, id]
    );

    // Registrar log de actividad
    await executeQuery(
      'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_anteriores, datos_nuevos, ip_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id_usuario,
        'cambiar_estado_espacio',
        'espacios',
        id,
        JSON.stringify({ estado: espacio.estado }),
        JSON.stringify({ estado }),
        req.ip
      ]
    );

    res.json({
      success: true,
      message: 'Estado del espacio actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar estado del espacio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/espacios/estadisticas - Estadísticas de espacios
router.get('/estadisticas/overview', async (req, res) => {
  try {
    const [estadisticas] = await executeQuery(`
      SELECT 
        COUNT(*) as total_espacios,
        SUM(CASE WHEN estado = 'libre' THEN 1 ELSE 0 END) as espacios_libres,
        SUM(CASE WHEN estado = 'ocupado' THEN 1 ELSE 0 END) as espacios_ocupados,

        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as espacios_mantenimiento,
        ROUND(AVG(tarifa_hora), 2) as tarifa_promedio
      FROM espacios
    `);

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
