-- =====================================================
-- SISTEMA POS PARQUEAMIENTO - ESQUEMA COMPLETO
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS pos_parqueamiento;
USE pos_parqueamiento;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS table_usuarios (
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
CREATE TABLE IF NOT EXISTS table_cliente (
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
CREATE TABLE IF NOT EXISTS table_espacio (
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
    FOREIGN KEY (id_cliente) REFERENCES table_cliente(idCliente) ON DELETE SET NULL,
    FOREIGN KEY (id_espacio) REFERENCES table_espacio(id_espacio) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES table_usuarios(id_usuario) ON DELETE RESTRICT,
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
CREATE TABLE IF NOT EXISTS table_cajas (
    id_table_cajas INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    id_usuario INT NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monto_final DECIMAL(10,2) NULL,
    hora_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_cierre TIMESTAMP NULL,
    diferencia DECIMAL(10,2) NULL,
    estado_diferencia ENUM('positiva', 'negativa') NULL,
    observaciones_apertura TEXT,
    observaciones_cierre TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES table_usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_usuario (id_usuario)
);

-- =====================================================
-- TABLA DE MOVIMIENTOS DE CAJA
-- =====================================================
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_caja INT NOT NULL,
    tipo_movimiento ENUM('ingreso', 'retiro') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    id_usuario INT NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_caja) REFERENCES table_cajas(id_table_cajas) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES table_usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_caja (id_caja),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_hora)
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS table_configuracion (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    ruc_empresa VARCHAR(20) NOT NULL,
    direccion_empresa TEXT,
    telefono_empresa VARCHAR(20),
    email_empresa VARCHAR(150),
    tarifa_base_auto DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    tarifa_base_camioneta DECIMAL(10,2) NOT NULL DEFAULT 7.50,
    tarifa_base_camion DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    horario_apertura TIME DEFAULT '08:00:00',
    horario_cierre TIME DEFAULT '18:00:00',
    moneda VARCHAR(10) DEFAULT 'USD',
    iva_porcentaje DECIMAL(5,2) DEFAULT 12.00,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado)
);

-- =====================================================
-- INSERCIÓN DE DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO table_usuarios (nombre, apellido, email, password, rol, estado) VALUES
('Administrador', 'Sistema', 'admin@parqueamiento.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'activo');

-- Espacios de parqueamiento por defecto
INSERT INTO table_espacio (numero_espacio, tipo_vehiculo, tarifa_hora, estado) VALUES
('A1', 'auto', 5.00, 'libre'),
('A2', 'auto', 5.00, 'libre'),
('A3', 'auto', 5.00, 'libre'),
('A4', 'auto', 5.00, 'libre'),
('A5', 'auto', 5.00, 'libre'),
('B1', 'camioneta', 7.50, 'libre'),
('B2', 'camioneta', 7.50, 'libre'),
('B3', 'camioneta', 7.50, 'libre'),
('C1', 'camion', 10.00, 'libre'),
('C2', 'camion', 10.00, 'libre');

-- Configuración por defecto
INSERT INTO table_configuracion (
    nombre_empresa, 
    ruc_empresa, 
    direccion_empresa, 
    telefono_empresa, 
    email_empresa,
    tarifa_base_auto,
    tarifa_base_camioneta,
    tarifa_base_camion,
    horario_apertura,
    horario_cierre,
    moneda,
    iva_porcentaje
) VALUES (
    'Parqueamiento Central',
    '12345678901',
    'Av. Principal 123, Ciudad',
    '+593 2 123 4567',
    'info@parqueamiento.com',
    5.00,
    7.50,
    10.00,
    '08:00:00',
    '18:00:00',
    'USD',
    12.00
);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de espacios ocupados con información de vehículos
CREATE OR REPLACE VIEW v_espacios_ocupados AS
SELECT 
    e.id_espacio,
    e.numero_espacio,
    e.tipo_vehiculo,
    e.tarifa_hora,
    v.id_venta,
    v.placa_vehiculo,
    v.hora_entrada,
    v.tiempo_total,
    c.Nombre_Cliente,
    c.Apellido_Cliente,
    c.telefono_Cliente,
    u.nombre as nombre_usuario
FROM table_espacio e
INNER JOIN ventas v ON e.id_espacio = v.id_espacio
LEFT JOIN table_cliente c ON v.id_cliente = c.idCliente
LEFT JOIN table_usuarios u ON v.id_usuario = u.id_usuario
WHERE e.estado = 'ocupado' AND v.estado = 'activa';

-- Vista de estadísticas diarias
CREATE OR REPLACE VIEW v_estadisticas_diarias AS
SELECT 
    fecha_venta,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as ventas_finalizadas,
    COUNT(CASE WHEN estado = 'activa' THEN 1 END) as ventas_activas,
    SUM(CASE WHEN estado = 'finalizada' THEN monto_total ELSE 0 END) as ingresos_totales,
    AVG(CASE WHEN estado = 'finalizada' THEN monto_total ELSE NULL END) as promedio_venta
FROM ventas
GROUP BY fecha_venta
ORDER BY fecha_venta DESC;

-- Vista de clientes con estadísticas
CREATE OR REPLACE VIEW v_clientes_estadisticas AS
SELECT 
    c.*,
    COUNT(v.id_venta) as total_ventas,
    SUM(CASE WHEN v.estado = 'finalizada' THEN v.monto_total ELSE 0 END) as total_gastado,
    MAX(v.fecha_venta) as ultima_visita
FROM table_cliente c
LEFT JOIN ventas v ON c.idCliente = v.id_cliente
GROUP BY c.idCliente;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento para finalizar una venta
CREATE PROCEDURE FinalizarVenta(
    IN p_id_venta INT,
    IN p_observaciones_salida TEXT
)
BEGIN
    DECLARE v_id_espacio INT;
    DECLARE v_tarifa_hora DECIMAL(10,2);
    DECLARE v_hora_entrada TIMESTAMP;
    DECLARE v_tiempo_total INT;
    DECLARE v_monto_total DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Obtener información de la venta
    SELECT id_espacio, tarifa_hora, hora_entrada
    INTO v_id_espacio, v_tarifa_hora, v_hora_entrada
    FROM ventas 
    WHERE id_venta = p_id_venta AND estado = 'activa';
    
    IF v_id_espacio IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venta activa no encontrada';
    END IF;
    
    -- Calcular tiempo total y monto
    SET v_tiempo_total = TIMESTAMPDIFF(MINUTE, v_hora_entrada, NOW());
    SET v_monto_total = CEIL(v_tiempo_total / 60.0) * v_tarifa_hora;
    
    -- Actualizar la venta
    UPDATE ventas SET 
        hora_salida = NOW(),
        tiempo_total = v_tiempo_total,
        monto_total = v_monto_total,
        estado = 'finalizada',
        observaciones_salida = p_observaciones_salida
    WHERE id_venta = p_id_venta;
    
    -- Liberar el espacio
    UPDATE table_espacio SET estado = 'libre' WHERE id_espacio = v_id_espacio;
    
    COMMIT;
    
    SELECT 
        v_tiempo_total as tiempo_total,
        v_monto_total as monto_total,
        CEIL(v_tiempo_total / 60.0) as horas;
END //

-- Procedimiento para abrir caja
CREATE PROCEDURE AbrirCaja(
    IN p_monto_inicial DECIMAL(10,2),
    IN p_id_usuario INT,
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_caja_abierta INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si ya hay una caja abierta
    SELECT COUNT(*) INTO v_caja_abierta
    FROM table_cajas 
    WHERE estado = 'abierta';
    
    IF v_caja_abierta > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una caja abierta';
    END IF;
    
    -- Crear nueva caja
    INSERT INTO table_cajas (
        fecha, 
        monto, 
        estado, 
        id_usuario, 
        monto_inicial,
        observaciones_apertura
    ) VALUES (
        CURDATE(), 
        p_monto_inicial, 
        'abierta', 
        p_id_usuario, 
        p_monto_inicial,
        p_observaciones
    );
    
    COMMIT;
    
    SELECT LAST_INSERT_ID() as id_caja;
END //

-- Procedimiento para cerrar caja
CREATE PROCEDURE CerrarCaja(
    IN p_id_caja INT,
    IN p_monto_final DECIMAL(10,2),
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_monto_inicial DECIMAL(10,2);
    DECLARE v_diferencia DECIMAL(10,2);
    DECLARE v_estado_diferencia VARCHAR(10);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Obtener monto inicial
    SELECT monto_inicial INTO v_monto_inicial
    FROM table_cajas 
    WHERE id_table_cajas = p_id_caja AND estado = 'abierta';
    
    IF v_monto_inicial IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Caja abierta no encontrada';
    END IF;
    
    -- Calcular diferencia
    SET v_diferencia = p_monto_final - v_monto_inicial;
    SET v_estado_diferencia = IF(v_diferencia >= 0, 'positiva', 'negativa');
    
    -- Cerrar la caja
    UPDATE table_cajas SET 
        monto = p_monto_final,
        estado = 'cerrada',
        hora_cierre = NOW(),
        monto_final = p_monto_final,
        diferencia = ABS(v_diferencia),
        estado_diferencia = v_estado_diferencia,
        observaciones_cierre = p_observaciones
    WHERE id_table_cajas = p_id_caja;
    
    COMMIT;
    
    SELECT 
        p_monto_final as monto_final,
        ABS(v_diferencia) as diferencia,
        v_estado_diferencia as estado_diferencia;
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
    UPDATE table_espacio 
    SET estado = 'ocupado' 
    WHERE id_espacio = NEW.id_espacio;
END //

-- Trigger para actualizar estado del espacio cuando se finaliza una venta
CREATE TRIGGER tr_venta_finalizada
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'finalizada' AND OLD.estado = 'activa' THEN
        UPDATE table_espacio 
        SET estado = 'libre' 
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END //

-- Trigger para actualizar estado del espacio cuando se cancela una venta
CREATE TRIGGER tr_venta_cancelada
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'cancelada' AND OLD.estado = 'activa' THEN
        UPDATE table_espacio 
        SET estado = 'libre' 
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para consultas frecuentes
CREATE INDEX idx_ventas_fecha_estado ON ventas(fecha_venta, estado);
CREATE INDEX idx_ventas_espacio_estado ON ventas(id_espacio, estado);
CREATE INDEX idx_ventas_cliente_fecha ON ventas(id_cliente, fecha_venta);
CREATE INDEX idx_cajas_fecha_estado ON table_cajas(fecha, estado);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(id_caja, fecha_hora);

-- =====================================================
-- PERMISOS Y USUARIOS (OPCIONAL)
-- =====================================================

-- Crear usuario para la aplicación (opcional)
-- CREATE USER 'pos_app'@'localhost' IDENTIFIED BY 'password_segura_123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON pos_parqueamiento.* TO 'pos_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
