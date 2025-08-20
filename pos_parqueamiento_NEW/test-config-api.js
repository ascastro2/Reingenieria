const axios = require('axios');

async function testConfigAPI() {
  try {
    console.log('🔍 Probando APIs de configuración...\n');

    // 1. Probar endpoint principal de configuración
    console.log('1️⃣ Probando GET /api/configuracion');
    const configResponse = await axios.get('http://localhost:5000/api/configuracion');
    console.log('✅ Status:', configResponse.status);
    console.log('📊 Datos recibidos:', configResponse.data);
    
    if (configResponse.data.success && configResponse.data.data) {
      const configs = Array.isArray(configResponse.data.data) ? configResponse.data.data : [configResponse.data.data];
      console.log(`   • Total configuraciones: ${configs.length}`);
      configs.forEach((config, index) => {
        console.log(`   • Config ${index + 1}: ID=${config.id_config}, Empresa=${config.nombre_empresa}, Tarifa=${config.tarifa_base}, IVA=${config.iva_porcentaje}%`);
      });
    }

    console.log('');

    // 2. Probar endpoint de información de empresa
    console.log('2️⃣ Probando GET /api/configuracion/empresa/info');
    const empresaResponse = await axios.get('http://localhost:5000/api/configuracion/empresa/info');
    console.log('✅ Status:', empresaResponse.status);
    console.log('📊 Datos recibidos:', empresaResponse.data);
    
    if (empresaResponse.data.success && empresaResponse.data.data) {
      const empresa = empresaResponse.data.data;
      console.log(`   • Empresa: ${empresa.nombre_empresa}`);
      console.log(`   • RUC: ${empresa.ruc_empresa}`);
      console.log(`   • Tarifa Base: $${empresa.tarifa_base}`);
      console.log(`   • IVA: ${empresa.iva_porcentaje}%`);
      console.log(`   • Estado: ${empresa.estado}`);
    }

    console.log('');

    // 3. Probar endpoint de configuración por ID (si hay configuraciones)
    if (configResponse.data.success && configResponse.data.data && configResponse.data.data.length > 0) {
      const firstConfig = Array.isArray(configResponse.data.data) ? configResponse.data.data[0] : configResponse.data.data;
      console.log(`3️⃣ Probando GET /api/configuracion/${firstConfig.id_config}`);
      
      try {
        const configByIdResponse = await axios.get(`http://localhost:5000/api/configuracion/${firstConfig.id_config}`);
        console.log('✅ Status:', configByIdResponse.status);
        console.log('📊 Datos recibidos:', configByIdResponse.data);
      } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎯 Pruebas de API completadas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testConfigAPI();
