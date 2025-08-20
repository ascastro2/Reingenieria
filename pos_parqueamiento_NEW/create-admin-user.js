const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/config.env' });

async function createAdminUser() {
  try {
    console.log('🔧 Configuración de base de datos:');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password:', process.env.DB_PASSWORD ? '***' : '(vacía)');

    // Crear conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_parqueamiento'
    });

    console.log('✅ Conexión a MySQL establecida correctamente');

    // Verificar si la tabla usuarios existe
    const [tables] = await connection.execute('SHOW TABLES LIKE "usuarios"');
    if (tables.length === 0) {
      console.log('❌ La tabla usuarios no existe. Creando...');
      
      // Crear tabla usuarios
      await connection.execute(`
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
        )
      `);
      console.log('✅ Tabla usuarios creada');
    } else {
      console.log('✅ Tabla usuarios ya existe');
    }

    // Verificar si el usuario admin ya existe
    const [existingUsers] = await connection.execute(
      'SELECT id_usuario, email FROM usuarios WHERE email = ?',
      ['admin@parqueamiento.com']
    );

    if (existingUsers.length > 0) {
      console.log('⚠️ El usuario admin ya existe. Actualizando contraseña...');
      
      // Generar hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Actualizar contraseña
      await connection.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@parqueamiento.com']
      );
      
      console.log('✅ Contraseña del usuario admin actualizada');
    } else {
      console.log('🔧 Creando usuario administrador...');
      
      // Generar hash de la contraseña
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Insertar usuario admin
      await connection.execute(
        'INSERT INTO usuarios (nombre, apellido, email, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?)',
        ['Administrador', 'Sistema', 'admin@parqueamiento.com', hashedPassword, 'admin', 'activo']
      );
      
      console.log('✅ Usuario administrador creado exitosamente');
    }

    // Verificar que el usuario se creó correctamente
    const [adminUser] = await connection.execute(
      'SELECT id_usuario, nombre, apellido, email, rol, estado FROM usuarios WHERE email = ?',
      ['admin@parqueamiento.com']
    );

    if (adminUser.length > 0) {
      console.log('✅ Usuario admin verificado:');
      console.log('ID:', adminUser[0].id_usuario);
      console.log('Nombre:', adminUser[0].nombre);
      console.log('Apellido:', adminUser[0].apellido);
      console.log('Email:', adminUser[0].email);
      console.log('Rol:', adminUser[0].rol);
      console.log('Estado:', adminUser[0].estado);
    }

    await connection.end();
    console.log('✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Error de acceso a la base de datos. Verifica las credenciales.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar a MySQL. Verifica que esté ejecutándose.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ La base de datos no existe. Crea la base de datos primero.');
    }
  }
}

createAdminUser();
