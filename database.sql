-- Crea la base de datos si no existe
-- En Aiven usamos la base de datos por defecto
USE defaultdb;

-- Crea la tabla de muebles
CREATE TABLE muebles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    material VARCHAR(100),
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba opcionales (para ver algo al iniciar)
INSERT INTO muebles (nombre, descripcion, material, precio, stock) VALUES
('Perfume Chanel No. 5', 'Fragancia icónica con notas florales y aldehídos.', 'Perfumes', 3200.00, 15),
('Blazer Casual Hombre', 'Saco ligero color azul marino, corte slim fit.', 'Ropa Hombre', 1599.90, 8),
('Vestido de Noche Rojo', 'Elegante vestido largo de seda para eventos formales.', 'Ropa Mujer', 2450.00, 5),
('Sofá Chesterfield', 'Sofá clásico de cuero con botones profundos.', 'Muebles', 12500.00, 2),
('Eau de Toilette Sauvage', 'Aroma fresco y amaderado para caballero.', 'Perfumes', 2800.00, 20),
('Jeans Levis 501', 'Pantalón de mezclilla corte recto clásico.', 'Ropa Hombre', 1200.00, 30),
('Blusa de Chifón', 'Blusa ligera con estampado floral primaveral.', 'Ropa Mujer', 650.00, 12),
('Mesita de Centro', 'Mesa minimalista de vidrio templado.', 'Muebles', 3200.50, 4);