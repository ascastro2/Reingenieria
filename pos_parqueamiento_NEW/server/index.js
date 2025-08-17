const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const espaciosRoutes = require('./routes/espacios');

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use('/api/', limiter);

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para obtener IP real
app.use((req, res, next) => {
  req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes.router);
app.use('/api/espacios', espaciosRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚗 Sistema POS Parqueamiento - API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚗 Bienvenido al Sistema POS Parqueamiento',
    api: '/api',
    health: '/api/health',
    documentation: 'Documentación disponible en el repositorio'
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware para manejar errores globales
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`�� Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('✅ Sistema POS Parqueamiento listo para recibir conexiones');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer();
