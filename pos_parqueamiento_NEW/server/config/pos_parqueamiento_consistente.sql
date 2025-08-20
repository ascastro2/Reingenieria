-- =====================================================
-- SISTEMA POS PARQUEAMIENTO - ESQUEMA COMPLETAMENTE CONSISTENTE
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS pos_parqueamiento;
USE pos_parqueamiento;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor', 'cajero') DEFAULT 'vendedor',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Cliente VARCHAR(100) NOT NULL,
    Apellido_Cliente VARCHAR(100) NOT NULL,
    razon_s_Cliente VARCHAR(200),
    ruc_Cliente VARCHAR(20),
    direccion_Cliente TEXT,
    telefono_Cliente VARCHAR(20) NOT NULL,
    correo_Cliente VARCHAR(150),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_nombre (Nombre_Cliente, Apellido_Cliente),
    INDEX idx_ruc (ruc_Cliente),
    INDEX idx_telefono (telefono_Cliente),
    INDEX idx_email (correo_Cliente)
);

-- =====================================================
-- TABLA DE ESPACIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS espacios (
    id_espacio INT AUTO_INCREMENT PRIMARY KEY,
    numero_espacio VARCHAR(20) UNIQUE NOT NULL,
    tipo_vehiculo ENUM('auto', 'camioneta', 'camion', 'moto') DEFAULT 'auto',
    tarifa_hora DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    estado ENUM('libre', 'ocupado', 'mantenimiento') DEFAULT 'libre',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (numero_espacio),
    INDEX idx_tipo (tipo_vehiculo),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA DE VENTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATE NOT NULL,
    hora_entrada TIMESTAMP NOT NULL,
    hora_salida TIMESTAMP NULL,
    tiempo_total INT NULL COMMENT 'Tiempo en minutos',
    tarifa_hora DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    id_cliente INT NULL,
    id_espacio INT NOT NULL,
    id_usuario INT NOT NULL,
    placa_vehiculo VARCHAR(20) NOT NULL,
    tipo_vehiculo ENUM('auto', 'camioneta', 'camion', 'moto') NOT NULL,
    observaciones TEXT,
    observaciones_salida TEXT,
    motivo_cancelacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(idCliente) ON DELETE SET NULL,
    FOREIGN KEY (id_espacio) REFERENCES espacios(id_espacio) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_fecha (fecha_venta),
    INDEX idx_estado (estado),
    INDEX idx_cliente (id_cliente),
    INDEX idx_espacio (id_espacio),
    INDEX idx_usuario (id_usuario),
    INDEX idx_placa (placa_vehiculo)
);

-- =====================================================
-- TABLA DE CAJA
-- =====================================================
CREATE TABLE IF NOT EXISTS caja (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    fecha_apertura TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP NULL,
    monto_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monto_final DECIMAL(10,2) NULL,
    total_ventas DECIMAL(10,2) NULL,
    total_retiros DECIMAL(10,2) NULL,
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    id_usuario INT NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_fecha (fecha_apertura),
    INDEX idx_estado (estado),
    INDEX idx_usuario (id_usuario)
);

-- =====================================================
-- TABLA DE MOVIMIENTOS DE CAJA
-- =====================================================
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_caja INT NOT NULL,
    tipo_movimiento ENUM('ingreso', 'egreso', 'retiro', 'deposito') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_caja) REFERENCES caja(id_caja) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_caja (id_caja),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_movimiento)
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    ruc_empresa VARCHAR(20),
    direccion_empresa TEXT,
    telefono_empresa VARCHAR(20),
    email_empresa VARCHAR(150),
    tarifa_base DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    tarifa_moto DECIMAL(10,2) NOT NULL DEFAULT 3.00,
    tarifa_camioneta DECIMAL(10,2) NOT NULL DEFAULT 6.00,
    tarifa_camion DECIMAL(10,2) NOT NULL DEFAULT 8.00,
    iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_actividad (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    id_registro INT,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip_usuario VARCHAR(45),
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_usuario (id_usuario),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_accion)
);

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO usuarios (nombre, apellido, email, password, rol, estado) VALUES
('Administrador', 'Sistema', 'admin@parqueamiento.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOeG', 'admin', 'activo');

-- Espacios de estacionamiento por defecto
INSERT INTO espacios (numero_espacio, tipo_vehiculo, tarifa_hora, estado) VALUES
('A1', 'auto', 5.00, 'libre'),
('A2', 'auto', 5.00, 'libre'),
('A3', 'auto', 5.00, 'libre'),
('A4', 'auto', 5.00, 'libre'),
('M1', 'moto', 3.00, 'libre'),
('M2', 'moto', 3.00, 'libre'),
('C1', 'camioneta', 6.00, 'libre'),
('T1', 'camion', 8.00, 'libre');

-- Configuración por defecto
INSERT INTO configuracion (nombre_empresa, ruc_empresa, direccion_empresa, telefono_empresa, email_empresa) VALUES
('Estacionamiento Central', '1234567890001', 'Av. Principal 123, Ciudad', '02-123-4567', 'info@estacionamiento.com');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de espacios ocupados
CREATE OR REPLACE VIEW v_espacios_ocupados AS
SELECT 
    e.id_espacio,
    e.numero_espacio,
    e.tipo_vehiculo,
    e.tarifa_hora,
    v.placa_vehiculo,
    v.hora_entrada,
    TIMESTAMPDIFF(MINUTE, v.hora_entrada, NOW()) as tiempo_ocupado_minutos,
    ROUND(TIMESTAMPDIFF(MINUTE, v.hora_entrada, NOW()) / 60.0 * e.tarifa_hora, 2) as monto_actual
FROM espacios e
INNER JOIN ventas v ON e.id_espacio = v.id_espacio
WHERE v.estado = 'activa';

-- Vista de estadísticas diarias
CREATE OR REPLACE VIEW v_estadisticas_diarias AS
SELECT 
    DATE(fecha_venta) as fecha,
    COUNT(*) as total_ventas,
    SUM(monto_total) as ingresos_totales,
    AVG(monto_total) as promedio_venta,
    COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as ventas_finalizadas,
    COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as ventas_canceladas
FROM ventas
GROUP BY DATE(fecha_venta);

-- Vista de resumen de caja
CREATE OR REPLACE VIEW v_resumen_caja AS
SELECT 
    c.id_caja,
    c.fecha_apertura,
    c.monto_inicial,
    COALESCE(c.monto_final, 0) as monto_final,
    COALESCE(c.total_ventas, 0) as total_ventas,
    COALESCE(c.total_retiros, 0) as total_retiros,
    c.estado,
    u.nombre as nombre_usuario
FROM caja c
INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
ORDER BY c.fecha_apertura DESC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para finalizar una venta
DELIMITER //
CREATE PROCEDURE FinalizarVenta(
    IN p_id_venta INT,
    IN p_observaciones_salida TEXT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_tiempo_total INT;
    DECLARE v_tarifa_hora DECIMAL(10,2);
    DECLARE v_monto_total DECIMAL(10,2);
    DECLARE v_id_espacio INT;
    
    -- Obtener información de la venta
    SELECT tiempo_total, tarifa_hora, id_espacio 
    INTO v_tiempo_total, v_tarifa_hora, v_id_espacio
    FROM ventas 
    WHERE id_venta = p_id_venta AND estado = 'activa';
    
    IF v_tiempo_total IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venta no encontrada o ya finalizada';
    END IF;
    
    -- Calcular monto total
    SET v_monto_total = ROUND(v_tiempo_total / 60.0 * v_tarifa_hora, 2);
    
    -- Actualizar venta
    UPDATE ventas 
    SET estado = 'finalizada',
        hora_salida = NOW(),
        monto_total = v_monto_total,
        observaciones_salida = p_observaciones_salida,
        fecha_actualizacion = NOW()
    WHERE id_venta = p_id_venta;
    
    -- Liberar espacio
    UPDATE espacios 
    SET estado = 'libre',
        ultima_actualizacion = NOW()
    WHERE id_espacio = v_id_espacio;
    
    -- Registrar log
    INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_nuevos, ip_usuario)
    VALUES (p_id_usuario, 'finalizar_venta', 'ventas', p_id_venta, CONCAT('Monto: ', v_monto_total), 'localhost');
    
    SELECT 'Venta finalizada exitosamente' as mensaje, v_monto_total as monto_total;
END //
DELIMITER ;

-- Procedimiento para abrir caja
DELIMITER //
CREATE PROCEDURE AbrirCaja(
    IN p_monto_inicial DECIMAL(10,2),
    IN p_id_usuario INT,
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_caja_abierta INT;
    
    -- Verificar si ya hay una caja abierta
    SELECT COUNT(*) INTO v_caja_abierta
    FROM caja 
    WHERE estado = 'abierta';
    
    IF v_caja_abierta > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una caja abierta';
    END IF;
    
    -- Abrir nueva caja
    INSERT INTO caja (fecha_apertura, monto_inicial, id_usuario, observaciones)
    VALUES (NOW(), p_monto_inicial, p_id_usuario, p_observaciones);
    
    -- Registrar log
    INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_nuevos, ip_usuario)
    VALUES (p_id_usuario, 'abrir_caja', 'caja', LAST_INSERT_ID(), CONCAT('Monto inicial: ', p_monto_inicial), 'localhost');
    
    SELECT 'Caja abierta exitosamente' as mensaje, LAST_INSERT_ID() as id_caja;
END //
DELIMITER ;

-- Procedimiento para cerrar caja
DELIMITER //
CREATE PROCEDURE CerrarCaja(
    IN p_id_caja INT,
    IN p_id_usuario INT,
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_total_ventas DECIMAL(10,2);
    DECLARE v_total_retiros DECIMAL(10,2);
    DECLARE v_monto_final DECIMAL(10,2);
    
    -- Calcular totales
    SELECT 
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
        COALESCE(SUM(CASE WHEN tipo_movimiento IN ('egreso', 'retiro') THEN monto ELSE 0 END), 0) as total_egresos
    INTO v_total_ventas, v_total_retiros
    FROM movimientos_caja 
    WHERE id_caja = p_id_caja;
    
    -- Calcular monto final
    SET v_monto_final = v_total_ventas - v_total_retiros;
    
    -- Cerrar caja
    UPDATE caja 
    SET estado = 'cerrada',
        fecha_cierre = NOW(),
        total_ventas = v_total_ventas,
        total_retiros = v_total_retiros,
        monto_final = v_monto_final,
        fecha_actualizacion = NOW()
    WHERE id_caja = p_id_caja;
    
    -- Registrar log
    INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, datos_nuevos, ip_usuario)
    VALUES (p_id_usuario, 'cerrar_caja', 'caja', p_id_caja, CONCAT('Monto final: ', v_monto_final), 'localhost');
    
    SELECT 'Caja cerrada exitosamente' as mensaje, v_monto_final as monto_total;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar estado del espacio cuando se crea una venta
DELIMITER //
CREATE TRIGGER tr_venta_creada
AFTER INSERT ON ventas
FOR EACH ROW
BEGIN
    UPDATE espacios 
    SET estado = 'ocupado',
        ultima_actualizacion = NOW()
    WHERE id_espacio = NEW.id_espacio;
END //
DELIMITER ;

-- Trigger para actualizar estado del espacio cuando se finaliza una venta
DELIMITER //
CREATE TRIGGER tr_venta_finalizada
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'finalizada' AND OLD.estado = 'activa' THEN
        UPDATE espacios 
        SET estado = 'libre',
            ultima_actualizacion = NOW()
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar estado del espacio cuando se cancela una venta
DELIMITER //
CREATE TRIGGER tr_venta_cancelada
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'cancelada' AND OLD.estado = 'activa' THEN
        UPDATE espacios 
        SET estado = 'libre',
            ultima_actualizacion = NOW()
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_ventas_fecha_estado ON ventas(fecha_venta, estado);
CREATE INDEX idx_ventas_cliente_estado ON ventas(id_cliente, estado);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(fecha_movimiento);
CREATE INDEX idx_logs_fecha_usuario ON logs_actividad(fecha_accion, id_usuario);

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
