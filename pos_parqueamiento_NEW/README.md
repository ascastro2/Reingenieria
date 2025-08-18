# 🚗 Sistema POS Parqueamiento - Versión Web Moderna

## 📋 Descripción

Sistema POS (Point of Sale) para gestión de parqueamientos/estacionamientos, re-ingenierizado desde una aplicación Java Swing a una aplicación web moderna utilizando tecnologías actuales.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- Login/logout con JWT
- Roles de usuario (admin, vendedor, cajero)
- Protección de rutas por rol
- Gestión de sesiones segura

### 👥 **Gestión de Clientes**
- CRUD completo de clientes
- Búsqueda avanzada por nombre, RUC o teléfono
- Validación de datos
- Historial de visitas

### 🚗 **Gestión de Espacios**
- Control de espacios de parqueamiento
- Estados: libre, ocupado, mantenimiento
- Diferentes tipos de vehículos (auto, camioneta, camión, moto)
- Tarifas personalizables por tipo

### 💰 **Sistema de Ventas**
- Registro de entrada de vehículos
- Cálculo automático de tarifas por tiempo
- Finalización de ventas con cálculo de montos
- Cancelación de ventas
- Historial completo de transacciones

### 🏦 **Control de Caja**
- Apertura y cierre de caja
- Control de montos iniciales y finales
- Registro de movimientos (ingresos/retiros)
- Cálculo de diferencias
- Auditoría completa

### 👤 **Gestión de Usuarios**
- CRUD completo de usuarios del sistema
- Gestión de roles y permisos
- Cambio de contraseñas
- Activación/desactivación de cuentas

### ⚙️ **Configuración del Sistema**
- Parámetros de la empresa
- Configuración de tarifas
- Gestión de horarios
- Configuración de impuestos (IVA)
- Historial de versiones de configuración

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Material-UI (MUI)** - Componentes de diseño
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP para API

### **Backend**
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **express-validator** - Validación de datos
- **Helmet** - Seguridad HTTP
- **CORS** - Compartir recursos entre orígenes

### **Base de Datos**
- **MySQL 8.0+** - Sistema de gestión de base de datos
- **phpMyAdmin** - Interfaz web para administración
- **Procedimientos almacenados** - Lógica de negocio
- **Triggers** - Automatización de procesos
- **Vistas** - Consultas optimizadas
- **Índices** - Optimización de consultas

## 📁 Estructura del Proyecto

```
pos_parqueamiento_NEW/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── contexts/      # Contextos de React
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilidades
│   ├── public/            # Archivos estáticos
│   └── package.json       # Dependencias del frontend
├── server/                # Backend Node.js
│   ├── routes/            # Rutas de la API
│   ├── config/            # Configuración
│   ├── middleware/        # Middlewares personalizados
│   └── package.json       # Dependencias del backend
├── database/              # Scripts de base de datos
│   └── pos_parqueamiento_completo.sql
├── package.json           # Dependencias del proyecto raíz
└── README.md             # Este archivo
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18.0.0 o superior
- npm 9.0.0 o superior
- MySQL 8.0 o superior
- phpMyAdmin (opcional, para administración)

### **1. Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd pos_parqueamiento_NEW
```

### **2. Instalar Dependencias**
```bash
# Instalar todas las dependencias (frontend + backend)
npm run install-all

# O instalar por separado:
npm install                    # Dependencias del proyecto raíz
cd server && npm install      # Dependencias del backend
cd ../client && npm install   # Dependencias del frontend
```

### **3. Configurar Base de Datos**

#### **Opción A: Usando phpMyAdmin**
1. Abrir phpMyAdmin
2. Crear nueva base de datos: `pos_parqueamiento`
3. Importar el archivo: `database/pos_parqueamiento_completo.sql`

#### **Opción B: Usando línea de comandos**
```bash
mysql -u root -p < database/pos_parqueamiento_completo.sql
```

### **4. Configurar Variables de Entorno**

#### **Backend (.env)**
```bash
cd server
cp env .env
```

Editar `server/.env`:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=pos_parqueamiento
DB_PORT=3306

# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Configuración CORS
CLIENT_URL=http://localhost:3000

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **5. Ejecutar la Aplicación**

#### **Desarrollo (Frontend + Backend simultáneamente)**
```bash
npm run dev
```

#### **Por separado:**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

#### **Producción:**
```bash
# Construir frontend
npm run build

# Ejecutar solo backend
npm start
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **phpMyAdmin**: http://localhost/phpmyadmin (si está configurado)

## 🔑 Credenciales por Defecto

- **Email**: admin@parqueamiento.com
- **Contraseña**: admin123
- **Rol**: Administrador

## 📚 API Endpoints

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar token

### **Clientes**
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente
- `GET /api/clientes/buscar/:termino` - Buscar clientes

### **Espacios**
- `GET /api/espacios` - Obtener todos los espacios
- `POST /api/espacios` - Crear nuevo espacio
- `PUT /api/espacios/:id` - Actualizar espacio
- `DELETE /api/espacios/:id` - Eliminar espacio

### **Ventas**
- `GET /api/ventas` - Obtener todas las ventas
- `POST /api/ventas` - Crear nueva venta (entrada)
- `PUT /api/ventas/:id/finalizar` - Finalizar venta (salida)
- `PUT /api/ventas/:id/cancelar` - Cancelar venta
- `GET /api/ventas/estadisticas/overview` - Estadísticas

### **Caja**
- `GET /api/caja` - Obtener todas las cajas
- `POST /api/caja/abrir` - Abrir caja
- `PUT /api/caja/:id/cerrar` - Cerrar caja
- `GET /api/caja/actual/estado` - Estado de caja actual

### **Usuarios**
- `GET /api/usuarios` - Obtener todos los usuarios (admin)
- `POST /api/usuarios` - Crear nuevo usuario (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (admin)
- `GET /api/usuarios/perfil/actual` - Perfil del usuario actual

### **Configuración**
- `GET /api/configuracion` - Obtener configuración actual
- `PUT /api/configuracion/:id` - Actualizar configuración (admin)
- `GET /api/configuracion/tarifas/actuales` - Tarifas actuales

## 🧪 Pruebas

### **Frontend**
```bash
cd client
npm test
```

### **Backend**
```bash
cd server
npm test
```

### **Linting**
```bash
# Linting del proyecto completo
npm run lint

# Linting por separado
npm run lint:server
npm run lint:client

# Corregir errores automáticamente
npm run lint:fix
```

## 📊 Funcionalidades Implementadas

### ✅ **Completamente Funcional (100%)**
- [x] Sistema de autenticación JWT
- [x] Gestión de espacios de parqueamiento
- [x] Gestión de clientes (CRUD completo)
- [x] Sistema de ventas (entrada/salida)
- [x] Control de caja (apertura/cierre)
- [x] Gestión de usuarios del sistema
- [x] Configuración del sistema
- [x] Interfaz de usuario moderna y responsive
- [x] API REST completa
- [x] Base de datos optimizada

### 🔄 **En Desarrollo**
- [ ] Generación de facturas PDF
- [ ] Reportes avanzados
- [ ] Sistema de backup automático
- [ ] Notificaciones en tiempo real
- [ ] Dashboard con gráficos avanzados

## 🚨 Solución de Problemas

### **Error de Conexión a Base de Datos**
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista
4. Verificar permisos del usuario

### **Error de Compilación Frontend**
1. Verificar versión de Node.js (>=18.0.0)
2. Limpiar cache: `npm cache clean --force`
3. Eliminar `node_modules` y reinstalar
4. Verificar versiones de dependencias

### **Error de CORS**
1. Verificar `CLIENT_URL` en `.env`
2. Verificar que el frontend esté en el puerto correcto
3. Verificar configuración de CORS en el backend

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Desarrollador Principal**: Equipo de Re-ingeniería
- **Tecnologías**: React, Node.js, MySQL
- **Versión**: 1.0.0

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 🔄 Historial de Versiones

### **v1.0.0 (2024-01-XX)**
- ✅ Sistema completo funcional
- ✅ Todas las funcionalidades principales implementadas
- ✅ Interfaz de usuario moderna
- ✅ API REST completa
- ✅ Base de datos optimizada

---

**¡El Sistema POS Parqueamiento está listo para producción! 🎉**
