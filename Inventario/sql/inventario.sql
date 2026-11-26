CREATE DATABASE IF NOT EXISTS inventario
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventario;

CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_productos_nombre (nombre),
  INDEX idx_productos_categoria (categoria)
) ENGINE=InnoDB;

INSERT INTO productos (nombre, categoria, stock)
SELECT 'Café americano', 'Bebidas', 15
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Café americano');

INSERT INTO productos (nombre, categoria, stock)
SELECT 'Galletas', 'Alimentos', 20
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Galletas');

INSERT INTO productos (nombre, categoria, stock)
SELECT 'Agua embotellada', 'Bebidas', 4
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Agua embotellada');
