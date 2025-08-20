const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/config.env' });

async function fixConfiguration() {
  let connection;
  
  try {
    console.log('🔧 Corrigiendo configuración del sistema...\n');
    
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_parqueamiento'
    });

    console.log('✅ Conexión a MySQL establecida correctamente\n');

    // 1. CORREGIR CONFIGURACIÓN DE LA EMPRESA
    console.log('⚙️ CORRIGIENDO CONFIGURACIÓN DE LA EMPRESA:');
    console.log('=============================================');
    
    const configCorregida = {
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
    };

    await connection.execute(
      'UPDATE configuracion SET nombre_empresa = ?, direccion_empresa = ?, email_empresa = ? WHERE id_config = 1',
      [configCorregida.nombre_empresa, configCorregida.direccion_empresa, configCorregida.email_empresa]
    );
    
    console.log('✅ Configuración de empresa actualizada');

    // 2. CORREGIR ESPACIOS INCORRECTOS
    console.log('\n🚗 CORRIGIENDO ESPACIOS INCORRECTOS:');
    console.log('=====================================');
    
    // Corregir T3 que está mal clasificado
    await connection.execute(
      'UPDATE espacios SET tipo_vehiculo = "camion" WHERE numero_espacio = "T3"'
    );
    console.log('✅ Espacio T3 corregido como camión');

    // Verificar que todos los espacios tengan el estado correcto
    const espaciosCorregidos = [
      { numero: 'A1', estado: 'ocupado' },
      { numero: 'A3', estado: 'ocupado' },
      { numero: 'M1', estado: 'ocupado' },
      { numero: 'M4', estado: 'ocupado' },
      { numero: 'C2', estado: 'ocupado' },
      { numero: 'T2', estado: 'ocupado' }
    ];

    for (const espacio of espaciosCorregidos) {
      await connection.execute(
        'UPDATE espacios SET estado = ? WHERE numero_espacio = ?',
        [espacio.estado, espacio.numero]
      );
      console.log(`✅ Espacio ${espacio.numero} marcado como ${espacio.estado}`);
    }

    // 3. VERIFICAR Y CORREGIR TARIFAS
    console.log('\n💰 VERIFICANDO TARIFAS:');
    console.log('=========================');
    
    const tarifasCorrectas = [
      { tipo: 'auto', tarifa: 5.00 },
      { tipo: 'moto', tarifa: 3.00 },
      { tipo: 'camioneta', tarifa: 6.00 },
      { tipo: 'camion', tarifa: 8.00 }
    ];

    for (const tarifa of tarifasCorrectas) {
      await connection.execute(
        'UPDATE espacios SET tarifa_hora = ? WHERE tipo_vehiculo = ?',
        [tarifa.tarifa, tarifa.tipo]
      );
      console.log(`✅ Tarifa para ${tarifa.tipo} actualizada a $${tarifa.tarifa}`);
    }

    // 4. CREAR VENTAS DE EJEMPLO ADICIONALES
    console.log('\n💰 CREANDO VENTAS ADICIONALES:');
    console.log('================================');
    
    // Obtener datos necesarios
    const [clientes] = await connection.execute('SELECT idCliente FROM clientes LIMIT 3');
    const [espaciosOcupados] = await connection.execute('SELECT id_espacio, tarifa_hora FROM espacios WHERE estado = "ocupado" LIMIT 3');
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios LIMIT 3');

    if (clientes.length > 0 && espaciosOcupados.length > 0 && usuarios.length > 0) {
      // Crear venta activa para A1
      await connection.execute(
        'INSERT INTO ventas (fecha_venta, hora_entrada, tarifa_hora, estado, id_cliente, id_espacio, id_usuario, placa_vehiculo, tipo_vehiculo, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [new Date(), new Date(Date.now() - 2 * 60 * 60 * 1000), 5.00, 'activa', clientes[0].idCliente, espaciosOcupados[0].id_espacio, usuarios[0].id_usuario, 'ABC-1234', 'auto', 'Cliente frecuente']
      );
      console.log('✅ Venta activa creada para espacio A1');

      // Crear venta activa para M1
      await connection.execute(
        'INSERT INTO ventas (fecha_venta, hora_entrada, tarifa_hora, estado, id_cliente, id_espacio, id_usuario, placa_vehiculo, tipo_vehiculo, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [new Date(), new Date(Date.now() - 1 * 60 * 60 * 1000), 3.00, 'activa', clientes[1].idCliente, espaciosOcupados[1].id_espacio, usuarios[1].id_usuario, 'XYZ-5678', 'moto', 'Cliente nuevo']
      );
      console.log('✅ Venta activa creada para espacio M1');
    }

    // 5. VERIFICAR INTEGRIDAD DE DATOS
    console.log('\n🔍 VERIFICANDO INTEGRIDAD DE DATOS:');
    console.log('=====================================');
    
    // Verificar que no haya espacios duplicados
    const [espaciosDuplicados] = await connection.execute(
      'SELECT numero_espacio, COUNT(*) as total FROM espacios GROUP BY numero_espacio HAVING COUNT(*) > 1'
    );
    
    if (espaciosDuplicados.length === 0) {
      console.log('✅ No hay espacios duplicados');
    } else {
      console.log('⚠️ Espacios duplicados encontrados:', espaciosDuplicados);
    }

    // Verificar que no haya clientes duplicados por RUC
    const [clientesDuplicados] = await connection.execute(
      'SELECT ruc_Cliente, COUNT(*) as total FROM clientes GROUP BY ruc_Cliente HAVING COUNT(*) > 1'
    );
    
    if (clientesDuplicados.length === 0) {
      console.log('✅ No hay clientes duplicados por RUC');
    } else {
      console.log('⚠️ Clientes duplicados por RUC encontrados:', clientesDuplicados);
    }

    // 6. ACTUALIZAR ESTADÍSTICAS
    console.log('\n📊 ACTUALIZANDO ESTADÍSTICAS:');
    console.log('================================');
    
    // Actualizar total de ventas en caja
    const [totalVentas] = await connection.execute('SELECT SUM(monto_total) as total FROM ventas WHERE estado = "finalizada"');
    const totalVentasHoy = totalVentas[0].total || 0;
    
    await connection.execute(
      'UPDATE caja SET total_ventas = ? WHERE estado = "abierta"',
      [totalVentasHoy]
    );
    
    console.log(`✅ Total de ventas actualizado: $${totalVentasHoy}`);

    console.log('\n🎉 ¡CONFIGURACIÓN CORREGIDA EXITOSAMENTE!');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

fixConfiguration();
