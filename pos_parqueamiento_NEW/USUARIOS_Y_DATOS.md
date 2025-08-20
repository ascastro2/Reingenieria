# 🚗 Sistema POS Parqueamiento - Usuarios y Datos

## 📋 Información General

Este documento contiene toda la información necesaria para acceder al sistema y entender los datos de ejemplo que se han creado en la base de datos.

## 🔐 Usuarios del Sistema

### 👑 Administradores
| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `admin@parqueamiento.com` | `admin123` | admin | Administrador principal del sistema |
| `sofia@parqueamiento.com` | `admin456` | admin | Administradora secundaria |

### 💼 Vendedores
| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `maria@parqueamiento.com` | `vendedor123` | vendedor | Vendedora principal |
| `ana@parqueamiento.com` | `vendedor456` | vendedor | Vendedora secundaria |

### 🏦 Cajeros
| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `carlos@parqueamiento.com` | `cajero123` | cajero | Cajero principal |
| `luis@parqueamiento.com` | `cajero456` | cajero | Cajero secundario |

## 🚗 Espacios de Estacionamiento

### Zona A - Autos (Tarifa: $5.00/hora)
- **A1** - Ocupado
- **A2** - Libre
- **A3** - Ocupado
- **A4** - Libre
- **A5** - Libre
- **A6** - Mantenimiento
- **A7** - Libre
- **A8** - Libre

### Zona M - Motos (Tarifa: $3.00/hora)
- **M1** - Ocupado
- **M2** - Libre
- **M3** - Libre
- **M4** - Ocupado
- **M5** - Libre

### Zona C - Camionetas (Tarifa: $6.00/hora)
- **C1** - Libre
- **C2** - Ocupado
- **C3** - Libre

### Zona T - Camiones (Tarifa: $8.00/hora)
- **T1** - Libre
- **T2** - Ocupado
- **T3** - Libre

## 👥 Clientes de Ejemplo

### Clientes Personales
1. **Juan Pérez** - RUC: 1234567890001 - Quito
2. **María García** - RUC: 1234567890002 - Guayaquil
3. **Carlos López** - RUC: 1234567890003 - Quito
4. **Ana Martínez** - RUC: 1234567890004 - Cuenca
5. **Luis Hernández** - RUC: 1234567890005 - Guayaquil
6. **Sofia González** - RUC: 1234567890006 - Quito
7. **Roberto Díaz** - RUC: 1234567890007 - Quito
8. **Carmen Vargas** - RUC: 1234567890008 - Cuenca

### Clientes Empresariales
1. **Empresa ABC S.A.** - RUC: 1234567890009 - Centro Empresarial, Quito
2. **Comercial XYZ Ltda.** - RUC: 1234567890010 - Zona Industrial, Guayaquil

## ⚙️ Configuración del Sistema

### Información de la Empresa
- **Nombre:** Estacionamiento Central Quito
- **RUC:** 1234567890001
- **Dirección:** Av. Amazonas N23-45 y Veintimilla, Quito, Ecuador
- **Teléfono:** 02-123-4567
- **Email:** info@estacionamientocentral.com

### Tarifas
- **Auto:** $5.00/hora
- **Moto:** $3.00/hora
- **Camioneta:** $6.00/hora
- **Camión:** $8.00/hora
- **IVA:** 12%

## 💰 Datos de Ejemplo Creados

### Ventas
- Se han creado ventas de ejemplo con diferentes estados (activa, finalizada)
- Incluyen diferentes tipos de vehículos y clientes

### Cajas
- Caja principal abierta con monto inicial de $100.00
- Movimientos de ingreso y egreso registrados

### Logs de Actividad
- Registros de login, creación de clientes, apertura de caja, etc.
- Trazabilidad completa de todas las acciones del sistema

## 🚀 Cómo Usar el Sistema

### 1. Iniciar el Servidor
```bash
cd server
npm run dev
```

### 2. Iniciar el Cliente
```bash
cd client
npm start
```

### 3. Acceder al Sistema
- Abrir navegador en: `http://localhost:3000`
- Usar cualquiera de las credenciales listadas arriba

## 🔧 Scripts Disponibles

### Crear Usuario Administrador
```bash
node create-admin-user.js
```

### Poblar Base de Datos
```bash
node populate-database.js
```

### Probar Conexión
```bash
node test-connection.js
```

### Probar Usuarios
```bash
node test-users.js
```

## 📊 Estadísticas de la Base de Datos

- **Total Usuarios:** 6
- **Total Clientes:** 10
- **Total Espacios:** 19
- **Total Ventas:** 1+
- **Total Cajas:** 1+

## 🛠️ Estructura de la Base de Datos

El sistema incluye las siguientes tablas principales:
- `usuarios` - Gestión de usuarios del sistema
- `clientes` - Registro de clientes
- `espacios` - Espacios de estacionamiento
- `ventas` - Transacciones de estacionamiento
- `caja` - Control de caja
- `movimientos_caja` - Movimientos financieros
- `configuracion` - Configuración del sistema
- `logs_actividad` - Auditoría del sistema

## 🔒 Seguridad

- Todas las contraseñas están hasheadas con bcrypt
- Sistema de autenticación JWT implementado
- Roles y permisos por usuario
- Logs de actividad para auditoría

## 📞 Soporte

Para cualquier consulta o problema:
- Revisar los logs del servidor
- Verificar la conexión a la base de datos
- Comprobar que MySQL esté ejecutándose
- Verificar las variables de entorno en `server/config.env`

---

**Nota:** Este es un sistema de desarrollo. Para producción, cambiar todas las contraseñas por defecto y configurar medidas de seguridad adicionales.
