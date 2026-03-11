CREATE DATABASE autocheck_db;
GO
USE autocheck_db;
GO

CREATE TABLE usuarios (
  id           INT IDENTITY(1,1) PRIMARY KEY,
  nombre       NVARCHAR(100) NOT NULL,
  email        NVARCHAR(150) UNIQUE NOT NULL,
  password     NVARCHAR(255) NOT NULL,
  membresia    BIT DEFAULT 0,
  creado_en    DATETIME DEFAULT GETDATE()
);

CREATE TABLE vehiculos (
  id           INT IDENTITY(1,1) PRIMARY KEY,
  usuario_id   INT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
  marca        NVARCHAR(50),
  modelo       NVARCHAR(50),
  año          INT,
  placa        NVARCHAR(20),
  combustible  NVARCHAR(30),
  kilometraje  INT
);

CREATE TABLE mantenimientos (
  id           INT IDENTITY(1,1) PRIMARY KEY,
  vehiculo_id  INT NOT NULL FOREIGN KEY REFERENCES vehiculos(id),
  tipo         NVARCHAR(100),
  fecha        DATETIME,
  kilometraje  INT,
  costo        DECIMAL(10,2),
  notas        NVARCHAR(500)
);
