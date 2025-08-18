-- Script para agregar usuarios adicionales al sistema
-- Las contraseñas están hasheadas con bcrypt

-- Usuario administrador adicional
INSERT INTO table_usuarios (nombre, apellido, email, password, rol, estado) VALUES
('Admin', 'Sistema', 'admin@admin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'activo');

-- Usuario vendedor
INSERT INTO table_usuarios (nombre, apellido, email, password, rol, estado) VALUES
('Vendedor', 'Sistema', 'vendedor@parqueamiento.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendedor', 'activo');

-- Usuario cajero
INSERT INTO table_usuarios (nombre, apellido, email, password, rol, estado) VALUES
('Cajero', 'Sistema', 'cajero@parqueamiento.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cajero', 'activo');

-- Nota: La contraseña para todos los usuarios es 'password'
-- Para generar nuevas contraseñas hasheadas, usar bcrypt con salt rounds 10
