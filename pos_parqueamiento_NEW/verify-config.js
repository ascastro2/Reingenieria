const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/config.env' });

async function verifyConfiguration() {
  let connection;
  
  try {
    console.log('🔍 Verificando configuración del sistema...\n');
    
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_parqueamiento'
    });

    console.log('✅ Conexión a MySQL establecida correctamente\n');

    // 1. VERIFICAR CONFIGURACIÓN
    console.log('⚙️ VERIFICANDO CONFIGURACIÓN DEL SISTEMA:');
    console.log('==========================================');
    
    const [config] = await connection.execute('SELECT * FROM configuracion LIMIT 1');
    
    if (config.length > 0) {
      const conf = config[0];
      console.log(`✅ Configuración encontrada:`);
      console.log(`   • ID: ${conf.id_config}`);
      console.log(`   • Empresa: ${conf.nombre_empresa}`);
      console.log(`   • RUC: ${conf.ruc_empresa}`);
      console.log(`   • Dirección: ${conf.direccion_empresa}`);
      console.log(`   • Teléfono: ${conf.telefono_empresa}`);
      console.log(`   • Email: ${conf.email_empresa}`);
      console.log(`   • Tarifa Base: $${conf.tarifa_base}`);
      console.log(`   • Tarifa Moto: $${conf.tarifa_moto}`);
      console.log(`   • Tarifa Camioneta: $${conf.tarifa_camioneta}`);
      console.log(`   • Tarifa Camión: $${conf.tarifa_camion}`);
      console.log(`   • IVA: ${conf.iva_porcentaje}%`);
      console.log(`   • Estado: ${conf.estado}`);
    } else {
      console.log('❌ No hay configuración en la base de datos');
    }

    // 2. VERIFICAR USUARIOS
    console.log('\n👥 VERIFICANDO USUARIOS:');
    console.log('==========================');
    
    const [usuarios] = await connection.execute('SELECT id_usuario, nombre, apellido, email, rol, estado FROM usuarios ORDER BY rol, nombre');
    
    if (usuarios.length > 0) {
      console.log(`✅ Total usuarios: ${usuarios.length}`);
      
      const roles = {};
      usuarios.forEach(user => {
        if (!roles[user.rol]) roles[user.rol] = [];
        roles[user.rol].push(user);
      });
      
      Object.keys(roles).forEach(rol => {
        console.log(`\n   ${rol.toUpperCase()} (${roles[rol].length}):`);
        roles[rol].forEach(user => {
          console.log(`     • ${user.nombre} ${user.apellido} (${user.email}) - ${user.estado}`);
        });
      });
    } else {
      console.log('❌ No hay usuarios en la base de datos');
    }

    // 3. VERIFICAR ESPACIOS
    console.log('\n🚗 VERIFICANDO ESPACIOS:');
    console.log('==========================');
    
    const [espacios] = await connection.execute('SELECT numero_espacio, tipo_vehiculo, tarifa_hora, estado FROM espacios ORDER BY numero_espacio');
    
    if (espacios.length > 0) {
      console.log(`✅ Total espacios: ${espacios.length}`);
      
      const tipos = {};
      espacios.forEach(espacio => {
        if (!tipos[espacio.tipo_vehiculo]) tipos[espacio.tipo_vehiculo] = [];
        tipos[espacio.tipo_vehiculo].push(espacio);
      });
      
      Object.keys(tipos).forEach(tipo => {
        console.log(`\n   ${tipo.toUpperCase()} (${tipos[tipo].length}):`);
        tipos[tipo].forEach(espacio => {
          console.log(`     • ${espacio.numero_espacio} - $${espacio.tarifa_hora}/hora - ${espacio.estado}`);
        });
      });
    } else {
      console.log('❌ No hay espacios en la base de datos');
    }

    // 4. VERIFICAR CLIENTES
    console.log('\n👤 VERIFICANDO CLIENTES:');
    console.log('==========================');
    
    const [clientes] = await connection.execute('SELECT idCliente, Nombre_Cliente, Apellido_Cliente, ruc_Cliente, estado FROM clientes ORDER BY Nombre_Cliente LIMIT 10');
    
    if (clientes.length > 0) {
      console.log(`✅ Total clientes: ${clientes.length}`);
      clientes.forEach(cliente => {
        console.log(`   • ${cliente.Nombre_Cliente} ${cliente.Apellido_Cliente} - RUC: ${cliente.ruc_Cliente} - ${cliente.estado}`);
      });
    } else {
      console.log('❌ No hay clientes en la base de datos');
    }

    // 5. VERIFICAR VENTAS
    console.log('\n💰 VERIFICANDO VENTAS:');
    console.log('==========================');
    
    const [ventas] = await connection.execute('SELECT COUNT(*) as total FROM ventas');
    const [ventasActivas] = await connection.execute('SELECT COUNT(*) as total FROM ventas WHERE estado = "activa"');
    const [ventasFinalizadas] = await connection.execute('SELECT COUNT(*) as total FROM ventas WHERE estado = "finalizada"');
    
    console.log(`✅ Total ventas: ${ventas[0].total}`);
    console.log(`   • Activas: ${ventasActivas[0].total}`);
    console.log(`   • Finalizadas: ${ventasFinalizadas[0].total}`);

    // 6. VERIFICAR CAJA
    console.log('\n🏦 VERIFICANDO CAJA:');
    console.log('==========================');
    
    const [cajas] = await connection.execute('SELECT id_caja, fecha_apertura, monto_inicial, estado FROM caja ORDER BY fecha_apertura DESC LIMIT 3');
    
    if (cajas.length > 0) {
      console.log(`✅ Total cajas: ${cajas.length}`);
      cajas.forEach(caja => {
        console.log(`   • ID: ${caja.id_caja} - ${caja.fecha_apertura} - $${caja.monto_inicial} - ${caja.estado}`);
      });
    } else {
      console.log('❌ No hay cajas en la base de datos');
    }

    // 7. VERIFICAR LOGS
    console.log('\n📝 VERIFICANDO LOGS:');
    console.log('==========================');
    
    const [logs] = await connection.execute('SELECT COUNT(*) as total FROM logs_actividad');
    console.log(`✅ Total logs de actividad: ${logs[0].total}`);

    console.log('\n🎯 VERIFICACIÓN COMPLETADA');
    console.log('============================');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

verifyConfiguration();
