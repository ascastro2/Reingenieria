const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { conditionalAuth } = require('./auth');

const router = express.Router();

router.use(conditionalAuth); // Aplicar autenticación condicional a todas las rutas

// Obtener toda la configuración
router.get('/', async (req, res) => {
  try {
    const configuracion = await executeQuery(`
      SELECT 
        id_config,
        nombre_empresa,
        ruc_empresa,
        direccion_empresa,
        telefono_empresa,
        email_empresa,
        tarifa_base,
        tarifa_moto,
        tarifa_camioneta,
        tarifa_camion,
        iva_porcentaje,
        estado
      FROM configuracion 
      ORDER BY id_config DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      data: configuracion
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la configuración'
    });
  }
});

// Obtener configuración por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const configuracion = await executeQuery(
      'SELECT * FROM configuracion WHERE id_config = ?',
      [id]
    );

    if (configuracion.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      data: configuracion[0]
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la configuración'
    });
  }
});

// Crear nueva configuración
router.post('/', [
  body('nombre_empresa').notEmpty().withMessage('El nombre de la empresa es requerido'),
  body('ruc_empresa').notEmpty().withMessage('El RUC de la empresa es requerido'),
  body('tarifa_base').isFloat({ min: 0 }).withMessage('La tarifa base debe ser un número positivo'),
  body('tarifa_moto').isFloat({ min: 0 }).withMessage('La tarifa para moto debe ser un número positivo'),
  body('tarifa_camioneta').isFloat({ min: 0 }).withMessage('La tarifa para camioneta debe ser un número positivo'),
  body('tarifa_camion').isFloat({ min: 0 }).withMessage('La tarifa para camión debe ser un número positivo'),
  body('iva_porcentaje').isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de IVA debe estar entre 0 y 100')
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
      nombre_empresa,
      ruc_empresa,
      direccion_empresa,
      telefono_empresa,
      email_empresa,
      tarifa_base,
      tarifa_moto,
      tarifa_camioneta,
      tarifa_camion,
      iva_porcentaje
    } = req.body;

    const result = await executeQuery(`
      INSERT INTO configuracion (
        nombre_empresa,
        ruc_empresa,
        direccion_empresa,
        telefono_empresa,
        email_empresa,
        tarifa_base,
        tarifa_moto,
        tarifa_camioneta,
        tarifa_camion,
        iva_porcentaje,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa')
    `, [nombre_empresa, ruc_empresa, direccion_empresa, telefono_empresa, email_empresa, tarifa_base, tarifa_moto, tarifa_camioneta, tarifa_camion, iva_porcentaje]);

    res.status(201).json({
      success: true,
      message: 'Configuración creada exitosamente',
      data: { id_config: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la configuración'
    });
  }
});

// Actualizar configuración
router.put('/:id', [
  body('nombre_empresa').notEmpty().withMessage('El nombre de la empresa es requerido'),
  body('ruc_empresa').notEmpty().withMessage('El RUC de la empresa es requerido'),
  body('tarifa_base').isFloat({ min: 0 }).withMessage('La tarifa base debe ser un número positivo'),
  body('tarifa_moto').isFloat({ min: 0 }).withMessage('La tarifa para moto debe ser un número positivo'),
  body('tarifa_camioneta').isFloat({ min: 0 }).withMessage('La tarifa para camioneta debe ser un número positivo'),
  body('tarifa_camion').isFloat({ min: 0 }).withMessage('La tarifa para camión debe ser un número positivo'),
  body('iva_porcentaje').isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de IVA debe estar entre 0 y 100')
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
      nombre_empresa,
      ruc_empresa,
      direccion_empresa,
      telefono_empresa,
      email_empresa,
      tarifa_base,
      tarifa_moto,
      tarifa_camioneta,
      tarifa_camion,
      iva_porcentaje
    } = req.body;

    const result = await executeQuery(`
      UPDATE configuracion SET 
        nombre_empresa = ?,
        ruc_empresa = ?,
        direccion_empresa = ?,
        telefono_empresa = ?,
        email_empresa = ?,
        tarifa_base = ?,
        tarifa_moto = ?,
        tarifa_camioneta = ?,
        tarifa_camion = ?,
        iva_porcentaje = ?
      WHERE id_config = ?
    `, [nombre_empresa, ruc_empresa, direccion_empresa, telefono_empresa, email_empresa, tarifa_base, tarifa_moto, tarifa_camioneta, tarifa_camion, iva_porcentaje, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la configuración'
    });
  }
});

// Obtener tarifas actuales
router.get('/tarifas/actuales', async (req, res) => {
  try {
    const tarifas = await executeQuery(`
      SELECT 
        tarifa_base,
        tarifa_moto,
        tarifa_camioneta,
        tarifa_camion
      FROM configuracion 
      WHERE estado = 'activa'
      ORDER BY id_config DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      data: tarifas[0] || {}
    });
  } catch (error) {
    console.error('Error al obtener tarifas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las tarifas'
    });
  }
});

// Obtener información de la empresa
router.get('/empresa/info', async (req, res) => {
  try {
    const empresa = await executeQuery(`
      SELECT 
        nombre_empresa,
        ruc_empresa,
        direccion_empresa,
        telefono_empresa,
        email_empresa
      FROM configuracion 
      WHERE estado = 'activa'
      ORDER BY id_config DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      data: empresa[0] || {}
    });
  } catch (error) {
    console.error('Error al obtener información de empresa:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la información de la empresa'
    });
  }
});

// Obtener configuración de impuestos
router.get('/impuestos/config', async (req, res) => {
  try {
    const impuestos = await executeQuery(`
      SELECT 
        iva_porcentaje
      FROM configuracion 
      WHERE estado = 'activa'
      ORDER BY id_config DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      data: impuestos[0] || {}
    });
  } catch (error) {
    console.error('Error al obtener configuración de impuestos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la configuración de impuestos'
    });
  }
});

// Activar/Desactivar configuración
router.put('/:id/estado', [
  body('estado').isIn(['activa', 'inactiva']).withMessage('Estado no válido')
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

    const result = await executeQuery(
      'UPDATE configuracion SET estado = ? WHERE id_config = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      message: `Configuración ${estado === 'activa' ? 'activada' : 'desactivada'} exitosamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado de configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar el estado de la configuración'
    });
  }
});

// Obtener historial de configuraciones
router.get('/historial/versiones', async (req, res) => {
  try {
    const historial = await executeQuery(`
      SELECT 
        id_config,
        nombre_empresa,
        fecha_creacion,
        estado,
        tarifa_base,
        tarifa_camioneta,
        tarifa_camion
      FROM configuracion 
      ORDER BY fecha_creacion DESC
    `);

    res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el historial de configuraciones'
    });
  }
});

// Restaurar configuración anterior
router.post('/:id/restaurar', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la configuración a restaurar
    const configuracion = await executeQuery(
      'SELECT * FROM configuracion WHERE id_config = ?',
      [id]
    );

    if (configuracion.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    const config = configuracion[0];

    // Desactivar configuración actual
    await executeQuery(
      'UPDATE configuracion SET estado = "inactiva" WHERE estado = "activa"'
    );

    // Crear nueva configuración con los valores restaurados
    const result = await executeQuery(`
      INSERT INTO configuracion (
        nombre_empresa,
        ruc_empresa,
        direccion_empresa,
        telefono_empresa,
        email_empresa,
        tarifa_base,
        tarifa_moto,
        tarifa_camioneta,
        tarifa_camion,
        iva_porcentaje,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa')
    `, [config.nombre_empresa, config.ruc_empresa, config.direccion_empresa, config.telefono_empresa, config.email_empresa, config.tarifa_base, config.tarifa_moto, config.tarifa_camioneta, config.tarifa_camion, config.iva_porcentaje]);

    res.json({
      success: true,
      message: 'Configuración restaurada exitosamente',
              data: { id_config: result.insertId }
    });
  } catch (error) {
    console.error('Error al restaurar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restaurar la configuración'
    });
  }
});

module.exports = router;
