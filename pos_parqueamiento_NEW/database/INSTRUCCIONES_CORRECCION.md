# 🔧 INSTRUCCIONES PARA CORREGIR LA BASE DE DATOS

## ❌ PROBLEMA IDENTIFICADO
El error indica que la tabla `table_cliente` no existe, pero en phpMyAdmin veo que se llama `clientes`.

## ✅ SOLUCIÓN

### 1. **Ejecutar el Script SQL Corregido**
En phpMyAdmin, ve a la pestaña "SQL" y ejecuta el archivo:
```
pos_parqueamiento_NEW/database/pos_parqueamiento_ajustado.sql
```

### 2. **O Ejecutar Comandos SQL Individuales**

#### **Crear la tabla de clientes correcta:**
```sql
CREATE TABLE IF NOT EXISTS clientes (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Cliente VARCHAR(100) NOT NULL,
    Apellido_Cliente VARCHAR(100) NOT NULL,
    razon_s_Cliente VARCHAR(200),
    ruc_Cliente VARCHAR(20),
    direccion_Cliente TEXT,
    telefono_Cliente VARCHAR(20) NOT NULL,
    correo_Cliente VARCHAR(150),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_nombre (Nombre_Cliente, Apellido_Cliente),
    INDEX idx_ruc (ruc_Cliente),
    INDEX idx_telefono (telefono_Cliente),
    INDEX idx_email (correo_Cliente)
);
```

#### **Insertar algunos clientes de prueba:**
```sql
INSERT INTO clientes (Nombre_Cliente, Apellido_Cliente, telefono_Cliente, correo_Cliente) VALUES
('Juan', 'Pérez', '0987654321', 'juan.perez@email.com'),
('María', 'González', '0987654322', 'maria.gonzalez@email.com'),
('Carlos', 'Rodríguez', '0987654323', 'carlos.rodriguez@email.com');
```

### 3. **Verificar que las Tablas Existan**
```sql
SHOW TABLES;
```

Deberías ver:
- ✅ `clientes`
- ✅ `usuarios` 
- ✅ `espacios`
- ✅ `ventas`
- ✅ `caja`
- ✅ `configuracion`
- ✅ `logs_actividad`

### 4. **Verificar la Estructura de la Tabla Clientes**
```sql
DESCRIBE clientes;
```

## 🚀 DESPUÉS DE LA CORRECCIÓN

1. **Reinicia el backend:**
   ```bash
   cd server
   npm start
   ```

2. **Verifica que la API funcione:**
   - Ve a `http://localhost:5000/api/health`
   - Debería responder correctamente

3. **Prueba la página de clientes:**
   - Ve a `http://localhost:3000/clientes`
   - Ya no debería dar error 500

## 📋 RESUMEN DE CAMBIOS REALIZADOS

- ✅ **CORS habilitado completamente** sin restricciones
- ✅ **Autenticación condicional** para desarrollo
- ✅ **Nombres de tablas corregidos** en las rutas del backend
- ✅ **Script SQL ajustado** con nombres correctos de tablas

## 🔍 VERIFICACIÓN FINAL

Si todo está correcto, deberías ver:
- ✅ Backend funcionando en puerto 5000
- ✅ Frontend funcionando en puerto 3000
- ✅ API `/api/clientes` respondiendo correctamente
- ✅ Página de clientes mostrando datos (aunque esté vacía inicialmente)
- ✅ Sin errores en la consola del navegador
