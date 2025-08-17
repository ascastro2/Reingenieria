# 🚗 Sistema POS Parqueamiento - Versión Web Moderna

Sistema de Punto de Venta para gestión de parqueamientos/estacionamientos, reingenierizado desde Java Swing a una aplicación web moderna usando React, Node.js y MySQL.

## ✨ Características Principales

- **🔐 Autenticación JWT** con roles de usuario (Admin, Vendedor, Cajero)
- **🏢 Gestión de Espacios** de parqueamiento con estados en tiempo real
- **👥 Gestión de Clientes** con información completa
- **🚗 Control de Vehículos** y estacionamientos
- **💰 Sistema de Ventas** con facturación automática
- **🏦 Control de Caja** con apertura/cierre y reportes
- **📊 Dashboard** con estadísticas en tiempo real
- **📱 Diseño Responsivo** para todos los dispositivos
- **🔒 Seguridad** con validaciones y logs de actividad

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js** - Servidor API REST
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **PDFKit** - Generación de reportes PDF

### Frontend
- **React 18** + **TypeScript** - Interfaz de usuario
- **Material-UI (MUI)** - Componentes y diseño
- **React Router** - Navegación entre páginas
- **React Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP

## 📋 Requisitos Previos

- **Node.js** 18+ y **npm** 9+
- **MySQL** 8.0+ o **MariaDB** 10.5+
- **phpMyAdmin** (opcional, para gestión de BD)

## 🚀 Instalación y Configuración

### 1. Clonar el Proyecto
```bash
git clone <url-del-repositorio>
cd pos_parqueamiento_NEW
```

### 2. Instalar Dependencias
```bash
# Instalar todas las dependencias (backend + frontend)
npm run install-all

# O instalar por separado:
npm install                    # Dependencias del proyecto principal
cd server && npm install      # Dependencias del backend
cd ../client && npm install   # Dependencias del frontend
```

### 3. Configurar Base de Datos

#### Opción A: Usando phpMyAdmin
1. Abrir phpMyAdmin en tu navegador
2. Crear una nueva base de datos llamada `pos_parqueamiento`
3. Importar el archivo `database/pos_parqueamiento.sql`

#### Opción B: Usando línea de comandos
```bash
mysql -u root -p < database/pos_parqueamiento.sql
```

### 4. Configurar Variables de Entorno
```bash
cd server
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Configuración de la Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pos_parqueamiento
DB_USER=root
DB_PASSWORD=tu_password_aqui

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración del Cliente
CLIENT_URL=http://localhost:3000
```

### 5. Ejecutar el Proyecto

#### Desarrollo (Backend + Frontend simultáneamente)
```bash
npm run dev
```

#### Solo Backend
```bash
npm run server
```

#### Solo Frontend
```bash
npm run client
```

#### Producción
```bash
npm run build    # Construir frontend
npm start        # Ejecutar servidor
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **phpMyAdmin**: http://localhost/phpmyadmin (si está instalado)

## 🔑 Credenciales por Defecto

- **Email**: admin@parqueamiento.com
- **Contraseña**: admin123
- **Rol**: Administrador

## 📁 Estructura del Proyecto

```
pos_parqueamiento_NEW/
├── server/                 # Backend Node.js
│   ├── config/            # Configuración de BD
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middlewares personalizados
│   ├── uploads/           # Archivos subidos
│   └── index.js           # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Servicios API
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Archivos estáticos
├── database/              # Scripts de base de datos
├── package.json           # Dependencias del proyecto
└── README.md             # Este archivo
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/change-password` - Cambiar contraseña

### Espacios
- `GET /api/espacios` - Listar todos los espacios
- `GET /api/espacios/libres` - Espacios disponibles
- `GET /api/espacios/ocupados` - Espacios ocupados
- `POST /api/espacios` - Crear nuevo espacio
- `PUT /api/espacios/:id` - Actualizar espacio
- `DELETE /api/espacios/:id` - Eliminar espacio

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Crear venta
- `GET /api/ventas/:id` - Obtener venta específica

### Caja
- `POST /api/caja/abrir` - Abrir caja
- `POST /api/caja/cerrar` - Cerrar caja
- `GET /api/caja/estado` - Estado actual de la caja

## 🎨 Personalización

### Cambiar Tema
Editar `client/src/App.tsx` en la sección del tema:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#tu_color_primario',
    },
    secondary: {
      main: '#tu_color_secundario',
    },
  },
});
```

### Agregar Nuevas Funcionalidades
1. Crear nueva ruta en `server/routes/`
2. Agregar endpoint en `server/index.js`
3. Crear componente en `client/src/pages/`
4. Agregar ruta en `client/src/App.tsx`

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 📦 Despliegue

### Heroku
```bash
# Configurar variables de entorno en Heroku
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=tu_host_mysql
heroku config:set DB_NAME=tu_base_de_datos
heroku config:set DB_USER=tu_usuario
heroku config:set DB_PASSWORD=tu_password
heroku config:set JWT_SECRET=tu_jwt_secret

# Desplegar
git push heroku main
```

### VPS/Dedicado
```bash
# Construir frontend
npm run build

# Configurar nginx/apache para servir archivos estáticos
# Configurar PM2 para el backend
pm2 start server/index.js --name "pos-parqueamiento"
```

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
- Verificar que MySQL esté ejecutándose
- Comprobar credenciales en `.env`
- Verificar que la base de datos exista

### Error de CORS
- Verificar `CLIENT_URL` en `.env`
- Asegurar que el frontend esté en el puerto correcto

### Error de JWT
- Verificar `JWT_SECRET` en `.env`
- Limpiar localStorage del navegador

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Equipo de Reingeniería** - *Desarrollo inicial*
- **Tu Nombre** - *Contribuciones adicionales*

## 🙏 Agradecimientos

- Sistema original en Java Swing
- Comunidad de React y Node.js
- Material-UI por los componentes
- MySQL por la base de datos robusta

---

## 📞 Soporte

Si tienes alguna pregunta o problema:

1. Revisar la sección de [Solución de Problemas](#-solución-de-problemas)
2. Buscar en los [Issues](../../issues) del repositorio
3. Crear un nuevo issue con detalles del problema
4. Contactar al equipo de desarrollo

**¡Disfruta usando el Sistema POS Parqueamiento! 🚗✨**
