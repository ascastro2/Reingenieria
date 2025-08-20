const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/config.env' });

// Datos de ejemplo para llenar la base de datos
const sampleData = {
  usuarios: [
    { nombre: 'María', apellido: 'González', email: 'maria@parqueamiento.com', password: 'vendedor123', rol: 'vendedor' },
    { nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@parqueamiento.com', password: 'cajero123', rol: 'cajero' },
    { nombre: 'Ana', apellido: 'Martínez', email: 'ana@parqueamiento.com', password: 'vendedor456', rol: 'vendedor' },
    { nombre: 'Luis', apellido: 'Hernández', email: 'luis@parqueamiento.com', password: 'cajero456', rol: 'cajero' },
    { nombre: 'Sofia', apellido: 'López', email: 'sofia@parqueamiento.com', password: 'admin456', rol: 'admin' }
  ],
  
  clientes: [
    { nombre: 'Juan', apellido: 'Pérez', razon_social: null, ruc: '1234567890001', direccion: 'Av. Amazonas 123, Quito', telefono: '0987654321', correo: 'juan.perez@email.com' },
    { nombre: 'María', apellido: 'García', razon_social: null, ruc: '1234567890002', direccion: 'Calle 10 de Agosto 456, Guayaquil', telefono: '0987654322', correo: 'maria.garcia@email.com' },
    { nombre: 'Carlos', apellido: 'López', razon_social: null, ruc: '1234567890003', direccion: 'Av. 6 de Diciembre 789, Quito', telefono: '0987654323', correo: 'carlos.lopez@email.com' },
    { nombre: 'Ana', apellido: 'Martínez', razon_social: null, ruc: '1234567890004', direccion: 'Calle Rocafuerte 321, Cuenca', telefono: '0987654324', correo: 'ana.martinez@email.com' },
    { nombre: 'Luis', apellido: 'Hernández', razon_social: null, ruc: '1234567890005', direccion: 'Av. 9 de Octubre 654, Guayaquil', telefono: '0987654325', correo: 'luis.hernandez@email.com' },
    { nombre: 'Sofia', apellido: 'González', razon_social: null, ruc: '1234567890006', direccion: 'Calle Sucre 987, Quito', telefono: '0987654326', correo: 'sofia.gonzalez@email.com' },
    { nombre: 'Roberto', apellido: 'Díaz', razon_social: null, ruc: '1234567890007', direccion: 'Av. 12 de Octubre 147, Quito', telefono: '0987654327', correo: 'roberto.diaz@email.com' },
    { nombre: 'Carmen', apellido: 'Vargas', razon_social: null, ruc: '1234567890008', direccion: 'Calle Bolívar 258, Cuenca', telefono: '0987654328', correo: 'carmen.vargas@email.com' },
    { nombre: 'Empresa ABC', apellido: 'S.A.', razon_social: 'Empresa ABC S.A.', ruc: '1234567890009', direccion: 'Centro Empresarial, Torre Norte, Piso 15', telefono: '02-123-4567', correo: 'contacto@empresaabc.com' },
    { nombre: 'Comercial XYZ', apellido: 'Ltda.', razon_social: 'Comercial XYZ Ltda.', ruc: '1234567890010', direccion: 'Zona Industrial, Bodega 25', telefono: '04-987-6543', correo: 'ventas@comercialxyz.com' }
  ],
  
  espacios: [
    // Zona A - Autos
    { numero_espacio: 'A1', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'ocupado' },
    { numero_espacio: 'A2', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'libre' },
    { numero_espacio: 'A3', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'ocupado' },
    { numero_espacio: 'A4', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'libre' },
    { numero_espacio: 'A5', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'libre' },
    { numero_espacio: 'A6', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'mantenimiento' },
    { numero_espacio: 'A7', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'libre' },
    { numero_espacio: 'A8', tipo_vehiculo: 'auto', tarifa_hora: 5.00, estado: 'libre' },
    
    // Zona M - Motos
    { numero_espacio: 'M1', tipo_vehiculo: 'moto', tarifa_hora: 3.00, estado: 'ocupado' },
    { numero_espacio: 'M2', tipo_vehiculo: 'moto', tarifa_hora: 3.00, estado: 'libre' },
    { numero_espacio: 'M3', tipo_vehiculo: 'moto', tarifa_hora: 3.00, estado: 'libre' },
    { numero_espacio: 'M4', tipo_vehiculo: 'moto', tarifa_hora: 3.00, estado: 'ocupado' },
    { numero_espacio: 'M5', tipo_vehiculo: 'moto', tarifa_hora: 3.00, estado: 'libre' },
    
    // Zona C - Camionetas
    { numero_espacio: 'C1', tipo_vehiculo: 'camioneta', tarifa_hora: 6.00, estado: 'libre' },
    { numero_espacio: 'C2', tipo_vehiculo: 'camioneta', tarifa_hora: 6.00, estado: 'ocupado' },
    { numero_espacio: 'C3', tipo_vehiculo: 'camioneta', tarifa_hora: 6.00, estado: 'libre' },
    
    // Zona T - Camiones
    { numero_espacio: 'T1', tipo_vehiculo: 'camion', tarifa_hora: 8.00, estado: 'libre' },
    { numero_espacio: 'T2', tipo_vehiculo: 'camion', tarifa_hora: 8.00, estado: 'ocupado' },
    { numero_espacio: 'T3', tipo_vehiculo: 'camion', tarifa_hora: 8.00, estado: 'libre' }
  ],
  
  configuracion: [
    {
      nombre_empresa: 'Estacionamiento Central Quito',
      ruc_empresa: '1234567890001',
      direccion_empresa: 'Av. Amazonas N23-45 y Veintimilla, Quito, Ecuador',
      telefono_empresa: '02-123-4567',
      email_empresa: 'info@estacionamientocentral.com',
      tarifa_base: 5.00,
      tarifa_moto: 3.00,
      tarifa_camioneta: 6.00,
      tarifa_camion: 8.00,
      iva_porcentaje: 12.00
    }
  ]
};

async function populateDatabase() {
  let connection;
  
  try {
    console.log('🚀 Iniciando población de base de datos...');
    
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_parqueamiento'
    });

    console.log('✅ Conexión a MySQL establecida correctamente');

    // 1. INSERTAR USUARIOS ADICIONALES
    console.log('\n👥 Insertando usuarios adicionales...');
    for (const usuario of sampleData.usuarios) {
      try {
        const hashedPassword = await bcrypt.hash(usuario.password, 12);
        await connection.execute(
          'INSERT INTO usuarios (nombre, apellido, email, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?)',
          [usuario.nombre, usuario.apellido, usuario.email, hashedPassword, usuario.rol, 'activo']
        );
        console.log(`✅ Usuario ${usuario.nombre} ${usuario.apellido} creado`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Usuario ${usuario.email} ya existe, actualizando contraseña...`);
          const hashedPassword = await bcrypt.hash(usuario.password, 12);
          await connection.execute(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [hashedPassword, usuario.email]
          );
          console.log(`✅ Contraseña de ${usuario.email} actualizada`);
        } else {
          console.error(`❌ Error al crear usuario ${usuario.email}:`, error.message);
        }
      }
    }

    // 2. INSERTAR CLIENTES
    console.log('\n👤 Insertando clientes...');
    for (const cliente of sampleData.clientes) {
      try {
        await connection.execute(
          'INSERT INTO clientes (Nombre_Cliente, Apellido_Cliente, razon_s_Cliente, ruc_Cliente, direccion_Cliente, telefono_Cliente, correo_Cliente, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [cliente.nombre, cliente.apellido, cliente.razon_social, cliente.ruc, cliente.direccion, cliente.telefono, cliente.correo, 'activo']
        );
        console.log(`✅ Cliente ${cliente.nombre} ${cliente.apellido} creado`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Cliente con RUC ${cliente.ruc} ya existe`);
        } else {
          console.error(`❌ Error al crear cliente ${cliente.nombre}:`, error.message);
        }
      }
    }

    // 3. INSERTAR ESPACIOS ADICIONALES
    console.log('\n🚗 Insertando espacios adicionales...');
    for (const espacio of sampleData.espacios) {
      try {
        await connection.execute(
          'INSERT INTO espacios (numero_espacio, tipo_vehiculo, tarifa_hora, estado) VALUES (?, ?, ?, ?)',
          [espacio.numero_espacio, espacio.tipo_vehiculo, espacio.tarifa_hora, espacio.estado]
        );
        console.log(`✅ Espacio ${espacio.numero_espacio} creado`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Espacio ${espacio.numero_espacio} ya existe`);
        } else {
          console.error(`❌ Error al crear espacio ${espacio.numero_espacio}:`, error.message);
        }
      }
    }

    // 4. INSERTAR CONFIGURACIÓN
    console.log('\n⚙️ Insertando configuración...');
    for (const config of sampleData.configuracion) {
      try {
        await connection.execute(
          'INSERT INTO configuracion (nombre_empresa, ruc_empresa, direccion_empresa, telefono_empresa, email_empresa, tarifa_base, tarifa_moto, tarifa_camioneta, tarifa_camion, iva_porcentaje, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [config.nombre_empresa, config.ruc_empresa, config.direccion_empresa, config.telefono_empresa, config.email_empresa, config.tarifa_base, config.tarifa_moto, config.tarifa_camioneta, config.tarifa_camion, config.iva_porcentaje, 'activa']
        );
        console.log(`✅ Configuración de ${config.nombre_empresa} creada`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Configuración ya existe, actualizando...`);
          await connection.execute(
            'UPDATE configuracion SET nombre_empresa = ?, ruc_empresa = ?, direccion_empresa = ?, telefono_empresa = ?, email_empresa = ?, tarifa_base = ?, tarifa_moto = ?, tarifa_camioneta = ?, tarifa_camion = ?, iva_porcentaje = ? WHERE id_config = 1',
            [config.nombre_empresa, config.ruc_empresa, config.direccion_empresa, config.telefono_empresa, config.email_empresa, config.tarifa_base, config.tarifa_moto, config.tarifa_camioneta, config.tarifa_camion, config.iva_porcentaje]
          );
          console.log(`✅ Configuración actualizada`);
        } else {
          console.error(`❌ Error al crear configuración:`, error.message);
        }
      }
    }

    // 5. CREAR VENTAS DE EJEMPLO
    console.log('\n💰 Creando ventas de ejemplo...');
    await createSampleVentas(connection);

    // 6. CREAR CAJAS DE EJEMPLO
    console.log('\n🏦 Creando cajas de ejemplo...');
    await createSampleCajas(connection);

    // 7. CREAR LOGS DE ACTIVIDAD
    console.log('\n📝 Creando logs de actividad...');
    await createSampleLogs(connection);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen de datos insertados:');
    await showDatabaseSummary(connection);

  } catch (error) {
    console.error('❌ Error durante la población de la base de datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

async function createSampleVentas(connection) {
  try {
    // Obtener algunos clientes, espacios y usuarios para crear ventas
    const [clientes] = await connection.execute('SELECT idCliente FROM clientes LIMIT 5');
    const [espacios] = await connection.execute('SELECT id_espacio, tarifa_hora FROM espacios WHERE estado = "ocupado" LIMIT 3');
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios LIMIT 3');

    if (clientes.length === 0 || espacios.length === 0 || usuarios.length === 0) {
      console.log('⚠️ No hay suficientes datos para crear ventas de ejemplo');
      return;
    }

    // Crear ventas de ejemplo
    const ventasEjemplo = [
      {
        fecha_venta: new Date(),
        hora_entrada: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        hora_salida: null,
        tiempo_total: null,
        tarifa_hora: espacios[0].tarifa_hora,
        monto_total: null,
        estado: 'activa',
        id_cliente: clientes[0].idCliente,
        id_espacio: espacios[0].id_espacio,
        id_usuario: usuarios[0].id_usuario,
        placa_vehiculo: 'ABC-1234',
        tipo_vehiculo: 'auto',
        observaciones: 'Cliente frecuente'
      },
      {
        fecha_venta: new Date(),
        hora_entrada: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        hora_salida: new Date(),
        tiempo_total: 60, // 1 hora
        tarifa_hora: espacios[1].tarifa_hora,
        monto_total: espacios[1].tarifa_hora,
        estado: 'finalizada',
        id_cliente: clientes[1].idCliente,
        id_espacio: espacios[1].id_espacio,
        id_usuario: usuarios[1].id_usuario,
        placa_vehiculo: 'XYZ-5678',
        tipo_vehiculo: 'camioneta',
        observaciones: 'Pago en efectivo',
        observaciones_salida: 'Salida normal'
      }
    ];

    for (const venta of ventasEjemplo) {
      try {
        await connection.execute(
          'INSERT INTO ventas (fecha_venta, hora_entrada, hora_salida, tiempo_total, tarifa_hora, monto_total, estado, id_cliente, id_espacio, id_usuario, placa_vehiculo, tipo_vehiculo, observaciones, observaciones_salida) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [venta.fecha_venta, venta.hora_entrada, venta.hora_salida, venta.tiempo_total, venta.tarifa_hora, venta.monto_total, venta.estado, venta.id_cliente, venta.id_espacio, venta.id_usuario, venta.placa_vehiculo, venta.tipo_vehiculo, venta.observaciones, venta.observaciones_salida]
        );
        console.log(`✅ Venta para placa ${venta.placa_vehiculo} creada`);
      } catch (error) {
        console.error(`❌ Error al crear venta:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error al crear ventas de ejemplo:', error.message);
  }
}

async function createSampleCajas(connection) {
  try {
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios WHERE rol IN ("admin", "cajero") LIMIT 2');

    if (usuarios.length === 0) {
      console.log('⚠️ No hay usuarios para crear cajas de ejemplo');
      return;
    }

    // Crear caja abierta
    const [cajaResult] = await connection.execute(
      'INSERT INTO caja (fecha_apertura, monto_inicial, estado, id_usuario, observaciones) VALUES (?, ?, ?, ?, ?)',
      [new Date(), 100.00, 'abierta', usuarios[0].id_usuario, 'Caja principal del día']
    );

    console.log(`✅ Caja abierta creada con ID: ${cajaResult.insertId}`);

    // Crear algunos movimientos de caja
    const movimientos = [
      { tipo_movimiento: 'ingreso', monto: 25.00, descripcion: 'Pago de estacionamiento ABC-1234' },
      { tipo_movimiento: 'ingreso', monto: 6.00, descripcion: 'Pago de estacionamiento XYZ-5678' },
      { tipo_movimiento: 'egreso', monto: 15.00, descripcion: 'Gastos de mantenimiento' }
    ];

    for (const movimiento of movimientos) {
      await connection.execute(
        'INSERT INTO movimientos_caja (id_caja, tipo_movimiento, monto, descripcion, id_usuario) VALUES (?, ?, ?, ?, ?)',
        [cajaResult.insertId, movimiento.tipo_movimiento, movimiento.monto, movimiento.descripcion, usuarios[0].id_usuario]
      );
    }

    console.log(`✅ ${movimientos.length} movimientos de caja creados`);

  } catch (error) {
    console.error('❌ Error al crear cajas de ejemplo:', error.message);
  }
}

async function createSampleLogs(connection) {
  try {
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios LIMIT 3');

    if (usuarios.length === 0) {
      console.log('⚠️ No hay usuarios para crear logs de ejemplo');
      return;
    }

    const logsEjemplo = [
      { accion: 'login', tabla_afectada: 'usuarios', descripcion: 'Inicio de sesión exitoso' },
      { accion: 'crear_cliente', tabla_afectada: 'clientes', descripcion: 'Nuevo cliente registrado' },
      { accion: 'abrir_caja', tabla_afectada: 'caja', descripcion: 'Caja abierta para el día' },
      { accion: 'registrar_venta', tabla_afectada: 'ventas', descripcion: 'Nueva venta registrada' }
    ];

    for (const log of logsEjemplo) {
      await connection.execute(
        'INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, datos_nuevos, ip_usuario) VALUES (?, ?, ?, ?, ?)',
        [usuarios[0].id_usuario, log.accion, log.tabla_afectada, log.descripcion, '192.168.1.100']
      );
    }

    console.log(`✅ ${logsEjemplo.length} logs de actividad creados`);

  } catch (error) {
    console.error('❌ Error al crear logs de ejemplo:', error.message);
  }
}

async function showDatabaseSummary(connection) {
  try {
    const [usuariosCount] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    const [clientesCount] = await connection.execute('SELECT COUNT(*) as total FROM clientes');
    const [espaciosCount] = await connection.execute('SELECT COUNT(*) as total FROM espacios');
    const [ventasCount] = await connection.execute('SELECT COUNT(*) as total FROM ventas');
    const [cajasCount] = await connection.execute('SELECT COUNT(*) as total FROM caja');

    console.log(`👥 Usuarios: ${usuariosCount[0].total}`);
    console.log(`👤 Clientes: ${clientesCount[0].total}`);
    console.log(`🚗 Espacios: ${espaciosCount[0].total}`);
    console.log(`💰 Ventas: ${ventasCount[0].total}`);
    console.log(`🏦 Cajas: ${cajasCount[0].total}`);

    // Mostrar algunos usuarios creados
    const [usuarios] = await connection.execute('SELECT nombre, apellido, email, rol FROM usuarios LIMIT 5');
    console.log('\n👥 Usuarios disponibles para login:');
    usuarios.forEach(user => {
      console.log(`   • ${user.nombre} ${user.apellido} (${user.email}) - Rol: ${user.rol}`);
    });

  } catch (error) {
    console.error('❌ Error al mostrar resumen:', error.message);
  }
}

// Ejecutar el script
populateDatabase();
