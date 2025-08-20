-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-08-2025 a las 01:59:23
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pos_parqueamiento`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AbrirCaja` (IN `p_monto_inicial` DECIMAL(10,2), IN `p_id_usuario` INT, IN `p_observaciones` TEXT)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CerrarCaja` (IN `p_id_caja` INT, IN `p_id_usuario` INT, IN `p_observaciones` TEXT)   BEGIN
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
    
    SELECT 'Caja cerrada exitosamente' as mensaje, v_monto_final as monto_final;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `FinalizarVenta` (IN `p_id_venta` INT, IN `p_observaciones_salida` TEXT, IN `p_id_usuario` INT)   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja`
--

CREATE TABLE `caja` (
  `id_caja` int(11) NOT NULL,
  `fecha_apertura` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_final` decimal(10,2) DEFAULT NULL,
  `total_ventas` decimal(10,2) DEFAULT NULL,
  `total_retiros` decimal(10,2) DEFAULT NULL,
  `estado` enum('abierta','cerrada') DEFAULT 'abierta',
  `id_usuario` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `caja`
--

INSERT INTO `caja` (`id_caja`, `fecha_apertura`, `fecha_cierre`, `monto_inicial`, `monto_final`, `total_ventas`, `total_retiros`, `estado`, `id_usuario`, `observaciones`, `fecha_creacion`) VALUES
(1, '2025-08-19 23:37:50', NULL, 100.00, NULL, 6.00, NULL, 'abierta', 1, 'Caja principal del día', '2025-08-19 23:32:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `idCliente` int(11) NOT NULL,
  `Nombre_Cliente` varchar(100) NOT NULL,
  `Apellido_Cliente` varchar(100) NOT NULL,
  `razon_s_Cliente` varchar(200) DEFAULT NULL,
  `ruc_Cliente` varchar(20) DEFAULT NULL,
  `direccion_Cliente` text DEFAULT NULL,
  `telefono_Cliente` varchar(20) NOT NULL,
  `correo_Cliente` varchar(150) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`idCliente`, `Nombre_Cliente`, `Apellido_Cliente`, `razon_s_Cliente`, `ruc_Cliente`, `direccion_Cliente`, `telefono_Cliente`, `correo_Cliente`, `fecha_registro`, `estado`) VALUES
(1, 'Juan', 'Pérez', NULL, '1234567890001', 'Av. Amazonas 123, Quito', '0987654321', 'juan.perez@email.com', '2025-08-19 23:32:03', 'activo'),
(2, 'María', 'García', NULL, '1234567890002', 'Calle 10 de Agosto 456, Guayaquil', '0987654322', 'maria.garcia@email.com', '2025-08-19 23:32:03', 'activo'),
(3, 'Carlos', 'López', NULL, '1234567890003', 'Av. 6 de Diciembre 789, Quito', '0987654323', 'carlos.lopez@email.com', '2025-08-19 23:32:03', 'activo'),
(4, 'Ana', 'Martínez', NULL, '1234567890004', 'Calle Rocafuerte 321, Cuenca', '0987654324', 'ana.martinez@email.com', '2025-08-19 23:32:03', 'activo'),
(5, 'Luis', 'Hernández', NULL, '1234567890005', 'Av. 9 de Octubre 654, Guayaquil', '0987654325', 'luis.hernandez@email.com', '2025-08-19 23:32:03', 'activo'),
(6, 'Sofia', 'González', NULL, '1234567890006', 'Calle Sucre 987, Quito', '0987654326', 'sofia.gonzalez@email.com', '2025-08-19 23:32:03', 'activo'),
(7, 'Roberto', 'Díaz', NULL, '1234567890007', 'Av. 12 de Octubre 147, Quito', '0987654327', 'roberto.diaz@email.com', '2025-08-19 23:32:03', 'activo'),
(8, 'Carmen', 'Vargas', NULL, '1234567890008', 'Calle Bolívar 258, Cuenca', '0987654328', 'carmen.vargas@email.com', '2025-08-19 23:32:03', 'activo'),
(9, 'Empresa ABC', 'S.A.', 'Empresa ABC S.A.', '1234567890009', 'Centro Empresarial, Torre Norte, Piso 15', '02-123-4567', 'contacto@empresaabc.com', '2025-08-19 23:32:03', 'activo'),
(10, 'Comercial XYZ', 'Ltda.', 'Comercial XYZ Ltda.', '1234567890010', 'Zona Industrial, Bodega 25', '04-987-6543', 'ventas@comercialxyz.com', '2025-08-19 23:32:03', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id_config` int(11) NOT NULL,
  `nombre_empresa` varchar(200) NOT NULL,
  `ruc_empresa` varchar(20) DEFAULT NULL,
  `direccion_empresa` text DEFAULT NULL,
  `telefono_empresa` varchar(20) DEFAULT NULL,
  `email_empresa` varchar(150) DEFAULT NULL,
  `tarifa_base` decimal(10,2) NOT NULL DEFAULT 5.00,
  `tarifa_moto` decimal(10,2) NOT NULL DEFAULT 3.00,
  `tarifa_camioneta` decimal(10,2) NOT NULL DEFAULT 6.00,
  `tarifa_camion` decimal(10,2) NOT NULL DEFAULT 8.00,
  `iva_porcentaje` decimal(5,2) NOT NULL DEFAULT 12.00,
  `estado` enum('activa','inactiva') DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id_config`, `nombre_empresa`, `ruc_empresa`, `direccion_empresa`, `telefono_empresa`, `email_empresa`, `tarifa_base`, `tarifa_moto`, `tarifa_camioneta`, `tarifa_camion`, `iva_porcentaje`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Estacionamiento Central Quito', '1234567890001', 'Av. Amazonas N23-45 y Veintimilla, Quito, Ecuador', '02-123-4567', 'info@estacionamientocentral.com', 5.00, 3.00, 6.00, 8.00, 12.00, 'activa', '2025-08-19 23:18:57', '2025-08-19 23:37:50'),
(2, 'Estacionamiento Central Quito', '1234567890001', 'Av. Amazonas N23-45 y Veintimilla, Quito, Ecuador', '02-123-4567', 'info@estacionamientocentral.com', 5.00, 3.00, 6.00, 8.00, 12.00, 'activa', '2025-08-19 23:32:03', '2025-08-19 23:32:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `espacios`
--

CREATE TABLE `espacios` (
  `id_espacio` int(11) NOT NULL,
  `numero_espacio` varchar(20) NOT NULL,
  `tipo_vehiculo` enum('auto','camioneta','camion','moto') DEFAULT 'auto',
  `tarifa_hora` decimal(10,2) NOT NULL DEFAULT 5.00,
  `estado` enum('libre','ocupado','mantenimiento') DEFAULT 'libre',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `espacios`
--

INSERT INTO `espacios` (`id_espacio`, `numero_espacio`, `tipo_vehiculo`, `tarifa_hora`, `estado`, `fecha_creacion`, `ultima_actualizacion`) VALUES
(1, 'A1', 'auto', 5.00, 'ocupado', '2025-08-19 23:18:57', '2025-08-19 23:37:50'),
(2, 'A2', 'auto', 5.00, 'libre', '2025-08-19 23:18:57', '2025-08-19 23:18:57'),
(3, 'A3', 'auto', 5.00, 'ocupado', '2025-08-19 23:18:57', '2025-08-19 23:37:50'),
(4, 'A4', 'auto', 5.00, 'libre', '2025-08-19 23:18:57', '2025-08-19 23:18:57'),
(5, 'M1', 'moto', 3.00, 'ocupado', '2025-08-19 23:18:57', '2025-08-19 23:37:50'),
(6, 'M2', 'moto', 3.00, 'libre', '2025-08-19 23:18:57', '2025-08-19 23:18:57'),
(7, 'C1', 'camioneta', 6.00, 'libre', '2025-08-19 23:18:57', '2025-08-19 23:18:57'),
(8, 'T1', 'camion', 8.00, 'libre', '2025-08-19 23:18:57', '2025-08-19 23:18:57'),
(13, 'A5', 'auto', 5.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(14, 'A6', 'auto', 5.00, 'mantenimiento', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(15, 'A7', 'auto', 5.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(16, 'A8', 'auto', 5.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(19, 'M3', 'moto', 3.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(20, 'M4', 'moto', 3.00, 'ocupado', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(21, 'M5', 'moto', 3.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(23, 'C2', 'camioneta', 6.00, 'ocupado', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(24, 'C3', 'camioneta', 6.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(26, 'T2', 'camion', 8.00, 'ocupado', '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(27, 'T3', 'camion', 8.00, 'libre', '2025-08-19 23:32:03', '2025-08-19 23:32:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_actividad`
--

CREATE TABLE `logs_actividad` (
  `id_log` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `tabla_afectada` varchar(100) DEFAULT NULL,
  `id_registro` int(11) DEFAULT NULL,
  `datos_anteriores` text DEFAULT NULL,
  `datos_nuevos` text DEFAULT NULL,
  `ip_usuario` varchar(45) DEFAULT NULL,
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `logs_actividad`
--

INSERT INTO `logs_actividad` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `id_registro`, `datos_anteriores`, `datos_nuevos`, `ip_usuario`, `fecha_accion`) VALUES
(1, 1, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:29:42'),
(2, 1, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:30:04'),
(3, 1, 'login', 'usuarios', NULL, NULL, 'Inicio de sesión exitoso', '192.168.1.100', '2025-08-19 23:32:03'),
(4, 1, 'crear_cliente', 'clientes', NULL, NULL, 'Nuevo cliente registrado', '192.168.1.100', '2025-08-19 23:32:03'),
(5, 1, 'abrir_caja', 'caja', NULL, NULL, 'Caja abierta para el día', '192.168.1.100', '2025-08-19 23:32:03'),
(6, 1, 'registrar_venta', 'ventas', NULL, NULL, 'Nueva venta registrada', '192.168.1.100', '2025-08-19 23:32:03'),
(7, 1, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:45'),
(8, 2, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:46'),
(9, 3, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:47'),
(10, 4, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:47'),
(11, 5, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:47'),
(12, 6, 'login', 'usuarios', NULL, NULL, NULL, '::1', '2025-08-19 23:35:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_caja`
--

CREATE TABLE `movimientos_caja` (
  `id_movimiento` int(11) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `tipo_movimiento` enum('ingreso','egreso','retiro','deposito') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `descripcion` text NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_caja`
--

INSERT INTO `movimientos_caja` (`id_movimiento`, `id_caja`, `tipo_movimiento`, `monto`, `descripcion`, `id_usuario`, `fecha_movimiento`) VALUES
(1, 1, 'ingreso', 25.00, 'Pago de estacionamiento ABC-1234', 1, '2025-08-19 23:32:03'),
(2, 1, 'ingreso', 6.00, 'Pago de estacionamiento XYZ-5678', 1, '2025-08-19 23:32:03'),
(3, 1, 'egreso', 15.00, 'Gastos de mantenimiento', 1, '2025-08-19 23:32:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','vendedor','cajero') DEFAULT 'vendedor',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `email`, `password`, `rol`, `estado`, `fecha_creacion`, `ultimo_acceso`) VALUES
(1, 'Administrador', 'Sistema', 'admin@parqueamiento.com', '$2b$12$RyckYxeibO.4Uf2XhaeRKe4pp9aR5/DSzY4dm2FhcvIWxN8bT8jU2', 'admin', 'activo', '2025-08-19 23:18:57', '2025-08-19 23:35:45'),
(2, 'María', 'González', 'maria@parqueamiento.com', '$2b$12$8H7t1H9IjCrmPU0id9Rc9ehcbYZ5jVdghuniByYyBSg3oXtAUOYO6', 'vendedor', 'activo', '2025-08-19 23:32:02', '2025-08-19 23:35:46'),
(3, 'Carlos', 'Rodríguez', 'carlos@parqueamiento.com', '$2b$12$KRN512NBEbqu2nWt5PKGYuggDdJP4FIQaoDTmdvx1tJzM5HX1yW6m', 'cajero', 'activo', '2025-08-19 23:32:02', '2025-08-19 23:35:47'),
(4, 'Ana', 'Martínez', 'ana@parqueamiento.com', '$2b$12$HGpnfqyZqCPMTXba6XX.Q.sJS05zNJH722ME6aLRuDDhrJ.XDofwS', 'vendedor', 'activo', '2025-08-19 23:32:03', '2025-08-19 23:35:47'),
(5, 'Luis', 'Hernández', 'luis@parqueamiento.com', '$2b$12$eT.CSyn71PQkqDyRSSYp/.rINfMmT25UESWSRYYYPsqP4uw5cVNEm', 'cajero', 'activo', '2025-08-19 23:32:03', '2025-08-19 23:35:47'),
(6, 'Sofia', 'López', 'sofia@parqueamiento.com', '$2b$12$tN6IELcZ9oYYrmV7gXqEu.qWe9FLc9teV.QKoHa64nJ4.zeapjBDa', 'admin', 'activo', '2025-08-19 23:32:03', '2025-08-19 23:35:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `fecha_venta` date NOT NULL,
  `hora_entrada` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hora_salida` timestamp NULL DEFAULT NULL,
  `tiempo_total` int(11) DEFAULT NULL COMMENT 'Tiempo en minutos',
  `tarifa_hora` decimal(10,2) NOT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `estado` enum('activa','finalizada','cancelada') DEFAULT 'activa',
  `id_cliente` int(11) DEFAULT NULL,
  `id_espacio` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `placa_vehiculo` varchar(20) NOT NULL,
  `tipo_vehiculo` enum('auto','camioneta','camion','moto') NOT NULL,
  `observaciones` text DEFAULT NULL,
  `observaciones_salida` text DEFAULT NULL,
  `motivo_cancelacion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `fecha_venta`, `hora_entrada`, `hora_salida`, `tiempo_total`, `tarifa_hora`, `monto_total`, `estado`, `id_cliente`, `id_espacio`, `id_usuario`, `placa_vehiculo`, `tipo_vehiculo`, `observaciones`, `observaciones_salida`, `motivo_cancelacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, '2025-08-19', '2025-08-19 22:32:03', '2025-08-19 23:32:03', 60, 6.00, 6.00, 'finalizada', 10, 23, 6, 'XYZ-5678', 'camioneta', 'Pago en efectivo', 'Salida normal', NULL, '2025-08-19 23:32:03', '2025-08-19 23:32:03'),
(2, '2025-08-19', '2025-08-19 21:37:50', NULL, NULL, 5.00, NULL, 'activa', 9, 1, 1, 'ABC-1234', 'auto', 'Cliente frecuente', NULL, NULL, '2025-08-19 23:37:50', '2025-08-19 23:37:50'),
(3, '2025-08-19', '2025-08-19 22:37:50', NULL, NULL, 3.00, NULL, 'activa', 10, 3, 6, 'XYZ-5678', 'moto', 'Cliente nuevo', NULL, NULL, '2025-08-19 23:37:50', '2025-08-19 23:37:50');

--
-- Disparadores `ventas`
--
DELIMITER $$
CREATE TRIGGER `tr_venta_cancelada` AFTER UPDATE ON `ventas` FOR EACH ROW BEGIN
    IF NEW.estado = 'cancelada' AND OLD.estado = 'activa' THEN
        UPDATE espacios 
        SET estado = 'libre',
            ultima_actualizacion = NOW()
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_venta_creada` AFTER INSERT ON `ventas` FOR EACH ROW BEGIN
    UPDATE espacios 
    SET estado = 'ocupado',
        ultima_actualizacion = NOW()
    WHERE id_espacio = NEW.id_espacio;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_venta_finalizada` AFTER UPDATE ON `ventas` FOR EACH ROW BEGIN
    IF NEW.estado = 'finalizada' AND OLD.estado = 'activa' THEN
        UPDATE espacios 
        SET estado = 'libre',
            ultima_actualizacion = NOW()
        WHERE id_espacio = NEW.id_espacio;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_espacios_ocupados`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_espacios_ocupados` (
`id_espacio` int(11)
,`numero_espacio` varchar(20)
,`tipo_vehiculo` enum('auto','camioneta','camion','moto')
,`tarifa_hora` decimal(10,2)
,`placa_vehiculo` varchar(20)
,`hora_entrada` timestamp
,`tiempo_ocupado_minutos` bigint(21)
,`monto_actual` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_estadisticas_diarias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_estadisticas_diarias` (
`fecha` date
,`total_ventas` bigint(21)
,`ingresos_totales` decimal(32,2)
,`promedio_venta` decimal(14,6)
,`ventas_finalizadas` bigint(21)
,`ventas_canceladas` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_resumen_caja`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_resumen_caja` (
`id_caja` int(11)
,`fecha_apertura` timestamp
,`monto_inicial` decimal(10,2)
,`monto_final` decimal(10,2)
,`total_ventas` decimal(10,2)
,`total_retiros` decimal(10,2)
,`estado` enum('abierta','cerrada')
,`nombre_usuario` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_espacios_ocupados`
--
DROP TABLE IF EXISTS `v_espacios_ocupados`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_espacios_ocupados`  AS SELECT `e`.`id_espacio` AS `id_espacio`, `e`.`numero_espacio` AS `numero_espacio`, `e`.`tipo_vehiculo` AS `tipo_vehiculo`, `e`.`tarifa_hora` AS `tarifa_hora`, `v`.`placa_vehiculo` AS `placa_vehiculo`, `v`.`hora_entrada` AS `hora_entrada`, timestampdiff(MINUTE,`v`.`hora_entrada`,current_timestamp()) AS `tiempo_ocupado_minutos`, round(timestampdiff(MINUTE,`v`.`hora_entrada`,current_timestamp()) / 60.0 * `e`.`tarifa_hora`,2) AS `monto_actual` FROM (`espacios` `e` join `ventas` `v` on(`e`.`id_espacio` = `v`.`id_espacio`)) WHERE `v`.`estado` = 'activa' ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_estadisticas_diarias`
--
DROP TABLE IF EXISTS `v_estadisticas_diarias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_estadisticas_diarias`  AS SELECT cast(`ventas`.`fecha_venta` as date) AS `fecha`, count(0) AS `total_ventas`, sum(`ventas`.`monto_total`) AS `ingresos_totales`, avg(`ventas`.`monto_total`) AS `promedio_venta`, count(case when `ventas`.`estado` = 'finalizada' then 1 end) AS `ventas_finalizadas`, count(case when `ventas`.`estado` = 'cancelada' then 1 end) AS `ventas_canceladas` FROM `ventas` GROUP BY cast(`ventas`.`fecha_venta` as date) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_resumen_caja`
--
DROP TABLE IF EXISTS `v_resumen_caja`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resumen_caja`  AS SELECT `c`.`id_caja` AS `id_caja`, `c`.`fecha_apertura` AS `fecha_apertura`, `c`.`monto_inicial` AS `monto_inicial`, coalesce(`c`.`monto_final`,0) AS `monto_final`, coalesce(`c`.`total_ventas`,0) AS `total_ventas`, coalesce(`c`.`total_retiros`,0) AS `total_retiros`, `c`.`estado` AS `estado`, `u`.`nombre` AS `nombre_usuario` FROM (`caja` `c` join `usuarios` `u` on(`c`.`id_usuario` = `u`.`id_usuario`)) ORDER BY `c`.`fecha_apertura` DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `caja`
--
ALTER TABLE `caja`
  ADD PRIMARY KEY (`id_caja`),
  ADD KEY `idx_fecha` (`fecha_apertura`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_usuario` (`id_usuario`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`idCliente`),
  ADD KEY `idx_nombre` (`Nombre_Cliente`,`Apellido_Cliente`),
  ADD KEY `idx_ruc` (`ruc_Cliente`),
  ADD KEY `idx_telefono` (`telefono_Cliente`),
  ADD KEY `idx_email` (`correo_Cliente`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id_config`);

--
-- Indices de la tabla `espacios`
--
ALTER TABLE `espacios`
  ADD PRIMARY KEY (`id_espacio`),
  ADD UNIQUE KEY `numero_espacio` (`numero_espacio`),
  ADD KEY `idx_numero` (`numero_espacio`),
  ADD KEY `idx_tipo` (`tipo_vehiculo`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_accion` (`accion`),
  ADD KEY `idx_fecha` (`fecha_accion`),
  ADD KEY `idx_logs_fecha_usuario` (`fecha_accion`,`id_usuario`);

--
-- Indices de la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_caja` (`id_caja`),
  ADD KEY `idx_tipo` (`tipo_movimiento`),
  ADD KEY `idx_fecha` (`fecha_movimiento`),
  ADD KEY `idx_movimientos_caja_fecha` (`fecha_movimiento`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `idx_fecha` (`fecha_venta`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_cliente` (`id_cliente`),
  ADD KEY `idx_espacio` (`id_espacio`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_placa` (`placa_vehiculo`),
  ADD KEY `idx_ventas_fecha_estado` (`fecha_venta`,`estado`),
  ADD KEY `idx_ventas_cliente_estado` (`id_cliente`,`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `caja`
--
ALTER TABLE `caja`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id_config` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `espacios`
--
ALTER TABLE `espacios`
  MODIFY `id_espacio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `caja`
--
ALTER TABLE `caja`
  ADD CONSTRAINT `caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  ADD CONSTRAINT `logs_actividad_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  ADD CONSTRAINT `movimientos_caja_ibfk_1` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  ADD CONSTRAINT `movimientos_caja_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`idCliente`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`id_espacio`) REFERENCES `espacios` (`id_espacio`),
  ADD CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
