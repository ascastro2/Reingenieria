-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-05-2023 a las 06:01:58
-- Versión del servidor: 10.4.24-MariaDB
-- Versión de PHP: 7.4.28

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `table_cajas`
--

CREATE TABLE `table_cajas` (
  `id_table_cajas` int(200) NOT NULL,
  `fecha` date NOT NULL,
  `monto` float NOT NULL,
  `estado` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `table_cajas`
--

INSERT INTO `table_cajas` (`id_table_cajas`, `fecha`, `monto`, `estado`) VALUES
(15, '2023-04-18', 5, 'cerrado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `table_cliente`
--

CREATE TABLE `table_cliente` (
  `idCliente` int(11) NOT NULL,
  `Nombre_Cliente` varchar(45) NOT NULL,
  `Apellido_Cliente` varchar(45) NOT NULL,
  `razon_s_Cliente` varchar(200) NOT NULL,
  `ruc_Cliente` varchar(20) NOT NULL,
  `direccion_Cliente` varchar(100) NOT NULL,
  `telefono_Cliente` varchar(20) NOT NULL,
  `correo_Cliente` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `table_cliente`
--

INSERT INTO `table_cliente` (`idCliente`, `Nombre_Cliente`, `Apellido_Cliente`, `razon_s_Cliente`, `ruc_Cliente`, `direccion_Cliente`, `telefono_Cliente`, `correo_Cliente`) VALUES
(14, 'maxi', 'lopez', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `table_configuracion`
--

CREATE TABLE `table_configuracion` (
  `id_configuracion` int(200) NOT NULL,
  `nombre_empresa` varchar(200) NOT NULL,
  `impuesto` varchar(200) NOT NULL,
  `moneda` varchar(200) NOT NULL,
  `simbolo_moneda` varchar(200) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ruc` varchar(200) NOT NULL,
  `celular` varchar(200) NOT NULL,
  `dimension_x` varchar(200) NOT NULL,
  `dimension_y` varchar(200) NOT NULL,
  `cantidad_ceros_boleta` varchar(200) NOT NULL,
  `cantidad_ceros_factura` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `table_configuracion`
--

INSERT INTO `table_configuracion` (`id_configuracion`, `nombre_empresa`, `impuesto`, `moneda`, `simbolo_moneda`, `direccion`, `ruc`, `celular`, `dimension_x`, `dimension_y`, `cantidad_ceros_boleta`, `cantidad_ceros_factura`) VALUES
(1, 'tusolutionweb tutos', '19', 'sol', '/S', 'av. san francisco', '20113322', '95464564', '310', '160', '000000000', '000000000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `table_espacio`
--

CREATE TABLE `table_espacio` (
  `id_espacio` int(11) NOT NULL,
  `zona` varchar(200) NOT NULL,
  `estado` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `table_espacio`
--

INSERT INTO `table_espacio` (`id_espacio`, `zona`, `estado`) VALUES
(8, 'espacio 1', 'ocupado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `table_facturas`
--

CREATE TABLE `table_facturas` (
  `No_Facturas` int(11) NOT NULL,
  `cliente` int(11) NOT NULL,
  `id_mesas` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `totals` int(11) NOT NULL,
  `nro_boleta` int(11) NOT NULL,
  `factura_boleta` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `table_facturas`
--

INSERT INTO `table_facturas` (`No_Facturas`, `cliente`, `id_mesas`, `fecha`, `totals`, `nro_boleta`, `factura_boleta`) VALUES
(144, 14, 8, '2023-05-18', 4, 1, 'boleta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(10) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `pasword` varchar(50) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni` int(8) NOT NULL,
  `telefono` int(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `usuario`, `pasword`, `tipo`, `nombres`, `apellidos`, `dni`, `telefono`) VALUES
(1, 'admin', 'admin', 'Administrador', 'Juan', 'Perez', 43121223, 321132);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `table_cajas`
--
ALTER TABLE `table_cajas`
  ADD PRIMARY KEY (`id_table_cajas`);

--
-- Indices de la tabla `table_cliente`
--
ALTER TABLE `table_cliente`
  ADD PRIMARY KEY (`idCliente`),
  ADD UNIQUE KEY `idCliente_UNIQUE` (`idCliente`);

--
-- Indices de la tabla `table_configuracion`
--
ALTER TABLE `table_configuracion`
  ADD PRIMARY KEY (`id_configuracion`);

--
-- Indices de la tabla `table_espacio`
--
ALTER TABLE `table_espacio`
  ADD PRIMARY KEY (`id_espacio`);

--
-- Indices de la tabla `table_facturas`
--
ALTER TABLE `table_facturas`
  ADD PRIMARY KEY (`No_Facturas`),
  ADD UNIQUE KEY `No_Facturas_UNIQUE` (`No_Facturas`),
  ADD KEY `llavesForaneas_Cliente_idx` (`cliente`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `table_cajas`
--
ALTER TABLE `table_cajas`
  MODIFY `id_table_cajas` int(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `table_cliente`
--
ALTER TABLE `table_cliente`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `table_configuracion`
--
ALTER TABLE `table_configuracion`
  MODIFY `id_configuracion` int(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `table_espacio`
--
ALTER TABLE `table_espacio`
  MODIFY `id_espacio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `table_facturas`
--
ALTER TABLE `table_facturas`
  MODIFY `No_Facturas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `table_facturas`
--
ALTER TABLE `table_facturas`
  ADD CONSTRAINT `table_Facturas_ibfk_1` FOREIGN KEY (`cliente`) REFERENCES `table_cliente` (`idCliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
