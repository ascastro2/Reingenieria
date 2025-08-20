-- =====================================================
-- SISTEMA POS PARQUEAMIENTO - VERSIÓN WEB
-- Base de datos para la reingeniería del sistema
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `pos_parqueamiento` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pos_parqueamiento`;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `apellido_usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin', 'vendedor', 'cajero') NOT NULL DEFAULT 'vendedor',
  `estado` enum('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` timestamp NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario administrador por defecto (password: admin123)
INSERT INTO `usuarios` (`nombre_usuario`, `apellido_usuario`, `email`, `password`, `rol`) VALUES
('Administrador', 'Sistema', 'admin@parqueamiento.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =====================================================
-- TABLA DE CLIENTES
-- =====================================================
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `razon_social` varchar(200),
  `ruc` varchar(20),
  `direccion` text,
  `telefono` varchar(20),
  `email` varchar(100),
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('activo', 'inactivo') DEFAULT 'activo',
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE ESPACIOS DE PARQUEAMIENTO
-- =====================================================
CREATE TABLE `espacios` (
  `id_espacio` int(11) NOT NULL AUTO_INCREMENT,
  `numero_espacio` varchar(10) NOT NULL UNIQUE,
  `tipo_vehiculo` enum('auto', 'camioneta', 'camion', 'moto') DEFAULT 'auto',
  `tarifa_hora` decimal(10,2) NOT NULL,
  `estado` enum('libre', 'ocupado', 'reservado', 'mantenimiento') DEFAULT 'libre',
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_espacio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar espacios de ejemplo
INSERT INTO `espacios` (`numero_espacio`, `tipo_vehiculo`, `tarifa_hora`, `estado`) VALUES
('A001', 'auto', 2.50, 'libre'),
('A002', 'auto', 2.50, 'libre'),
('A003', 'auto', 2.50, 'libre'),
('B001', 'camioneta', 3.00, 'libre'),
('B002', 'camioneta', 3.00, 'libre'),
('C001', 'camion', 4.50, 'libre'),
('M001', 'moto', 1.50, 'libre'),
('M002', 'moto', 1.50, 'libre');

-- =====================================================
-- TABLA DE VEHÍCULOS
-- =====================================================
CREATE TABLE `vehiculos` (
  `id_vehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `placa` varchar(20) NOT NULL UNIQUE,
  `marca` varchar(50),
  `modelo` varchar(50),
  `color` varchar(30),
  `id_cliente` int(11),
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vehiculo`),
  FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE ESTACIONAMIENTOS
-- =====================================================
CREATE TABLE `estacionamientos` (
  `id_estacionamiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_espacio` int(11) NOT NULL,
  `id_vehiculo` int(11) NOT NULL,
  `id_cliente` int(11),
  `fecha_entrada` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_salida` timestamp NULL,
  `tarifa_aplicada` decimal(10,2) NOT NULL,
  `total_pagar` decimal(10,2),
  `estado` enum('activo', 'finalizado', 'cancelado') DEFAULT 'activo',
  `observaciones` text,
  PRIMARY KEY (`id_estacionamiento`),
  FOREIGN KEY (`id_espacio`) REFERENCES `espacios`(`id_espacio`),
  FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`),
  FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE VENTAS/FACTURAS
-- =====================================================
CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(20) NOT NULL UNIQUE,
  `id_estacionamiento` int(11) NOT NULL,
  `id_cliente` int(11),
  `id_usuario` int(11) NOT NULL,
  `fecha_venta` timestamp DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) NOT NULL,
  `impuesto` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
  `estado` enum('pendiente', 'pagado', 'anulado') DEFAULT 'pendiente',
  `observaciones` text,
  PRIMARY KEY (`id_venta`),
  FOREIGN KEY (`id_estacionamiento`) REFERENCES `estacionamientos`(`id_estacionamiento`),
  FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE SET NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE CAJA
-- =====================================================
CREATE TABLE `caja` (
  `id_caja` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL,
  `monto_apertura` decimal(10,2) NOT NULL,
  `monto_cierre` decimal(10,2),
  `total_ventas` decimal(10,2) DEFAULT 0.00,
  `total_efectivo` decimal(10,2) DEFAULT 0.00,
  `total_tarjeta` decimal(10,2) DEFAULT 0.00,
  `total_transferencia` decimal(10,2) DEFAULT 0.00,
  `estado` enum('abierta', 'cerrada') DEFAULT 'abierta',
  `observaciones` text,
  PRIMARY KEY (`id_caja`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE CONFIGURACIÓN
-- =====================================================
CREATE TABLE `configuracion` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(200) NOT NULL,
  `ruc_empresa` varchar(20),
  `direccion_empresa` text,
  `telefono_empresa` varchar(20),
  `email_empresa` varchar(100),
  `impuesto_porcentaje` decimal(5,2) DEFAULT 19.00,
  `moneda` varchar(10) DEFAULT 'PEN',
  `simbolo_moneda` varchar(5) DEFAULT 'S/',
  `formato_factura` varchar(50) DEFAULT 'F001-00000000',
  `formato_boleta` varchar(50) DEFAULT 'B001-00000000',
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuración por defecto
INSERT INTO `configuracion` (`nombre_empresa`, `ruc_empresa`, `direccion_empresa`, `telefono_empresa`, `email_empresa`) VALUES
('Parqueamiento Central', '20113322', 'Av. San Francisco 123, Lima', '01-234-5678', 'info@parqueamiento.com');

-- =====================================================
-- TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE `logs_actividad` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11),
  `accion` varchar(100) NOT NULL,
  `tabla_afectada` varchar(50),
  `id_registro` int(11),
  `datos_anteriores` json,
  `datos_nuevos` json,
  `fecha_accion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ip_usuario` varchar(45),
  PRIMARY KEY (`id_log`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX idx_estacionamientos_fecha_entrada ON estacionamientos(fecha_entrada);
CREATE INDEX idx_estacionamientos_estado ON estacionamientos(estado);
CREATE INDEX idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_caja_estado ON caja(estado);
CREATE INDEX idx_espacios_estado ON espacios(estado);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de espacios ocupados
CREATE VIEW `v_espacios_ocupados` AS
SELECT 
  e.id_espacio,
  e.numero_espacio,
  e.tipo_vehiculo,
  e.tarifa_hora,
  est.fecha_entrada,
  v.placa,
  v.marca,
  v.modelo,
  v.color,
  c.nombre,
  c.apellido,
  TIMESTAMPDIFF(MINUTE, est.fecha_entrada, NOW()) as minutos_estacionado,
  ROUND((TIMESTAMPDIFF(MINUTE, est.fecha_entrada, NOW()) / 60) * e.tarifa_hora, 2) as monto_actual
FROM espacios e
JOIN estacionamientos est ON e.id_espacio = est.id_espacio
JOIN vehiculos v ON est.id_vehiculo = v.id_vehiculo
LEFT JOIN clientes c ON est.id_cliente = c.id_cliente
WHERE est.estado = 'activo';

-- Vista de resumen de caja
CREATE VIEW `v_resumen_caja` AS
SELECT 
  c.id_caja,
  c.fecha_apertura,
  c.fecha_cierre,
  u.nombre_usuario,
  c.monto_apertura,
  c.total_ventas,
  c.total_efectivo,
  c.total_tarjeta,
  c.total_transferencia,
  c.estado
FROM caja c
JOIN usuarios u ON c.id_usuario = u.id_usuario;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento para calcular total de estacionamiento
CREATE PROCEDURE `CalcularTotalEstacionamiento`(
  IN p_id_estacionamiento INT,
  OUT p_total DECIMAL(10,2)
)
BEGIN
  DECLARE v_tarifa_hora DECIMAL(10,2);
  DECLARE v_minutos INT;
  
  SELECT 
    e.tarifa_hora,
    TIMESTAMPDIFF(MINUTE, est.fecha_entrada, NOW())
  INTO v_tarifa_hora, v_minutos
  FROM estacionamientos est
  JOIN espacios e ON est.id_espacio = e.id_espacio
  WHERE est.id_estacionamiento = p_id_estacionamiento;
  
  SET p_total = ROUND((v_minutos / 60) * v_tarifa_hora, 2);
END //

-- Procedimiento para liberar espacio
CREATE PROCEDURE `LiberarEspacio`(
  IN p_id_estacionamiento INT
)
BEGIN
  DECLARE v_id_espacio INT;
  
  START TRANSACTION;
  
  SELECT id_espacio INTO v_id_espacio
  FROM estacionamientos
  WHERE id_estacionamiento = p_id_estacionamiento;
  
  UPDATE estacionamientos 
  SET estado = 'finalizado', fecha_salida = NOW()
  WHERE id_estacionamiento = p_id_estacionamiento;
  
  UPDATE espacios 
  SET estado = 'libre'
  WHERE id_espacio = v_id_espacio;
  
  COMMIT;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar estado de espacio cuando se crea estacionamiento
DELIMITER //
CREATE TRIGGER `tr_estacionamiento_insert` 
AFTER INSERT ON `estacionamientos`
FOR EACH ROW
BEGIN
  UPDATE espacios SET estado = 'ocupado' WHERE id_espacio = NEW.id_espacio;
END //

-- Trigger para actualizar estado de espacio cuando se finaliza estacionamiento
CREATE TRIGGER `tr_estacionamiento_update` 
AFTER UPDATE ON `estacionamientos`
FOR EACH ROW
BEGIN
  IF NEW.estado = 'finalizado' AND OLD.estado = 'activo' THEN
    UPDATE espacios SET estado = 'libre' WHERE id_espacio = NEW.id_espacio;
  END IF;
END //
DELIMITER ;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
