import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos.');

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction();

    // Limpiar datos existentes en orden correcto
    await queryRunner.query(`DELETE FROM documents`);
    await queryRunner.query(`DELETE FROM mantenimientos`);
    await queryRunner.query(`DELETE FROM vehiculos`);
    await queryRunner.query(`DELETE FROM usuarios`);

    // Resetear secuencias
    await queryRunner.query(`ALTER SEQUENCE usuarios_id_seq RESTART WITH 1`);
    await queryRunner.query(`ALTER SEQUENCE vehiculos_id_seq RESTART WITH 1`);
    await queryRunner.query(`ALTER SEQUENCE mantenimientos_id_seq RESTART WITH 1`);
    await queryRunner.query(`ALTER SEQUENCE documents_id_seq RESTART WITH 1`);

    console.log('Tablas limpiadas.');

    // Usuarios de prueba
    const password1 = await bcrypt.hash('AutoCheck123!', 10);
    const password2 = await bcrypt.hash('AutoCheck123!', 10);
    const password3 = await bcrypt.hash('AutoCheck123!', 10);

    await queryRunner.query(`
      INSERT INTO usuarios (nombre, email, password, membresia)
      VALUES
        ('Carlos Rodríguez', 'carlos@autocheck.com', '${password1}', false),
        ('María González', 'maria@autocheck.com', '${password2}', false),
        ('Juan Pérez', 'juan@autocheck.com', '${password3}', false)
    `);
    console.log('Usuarios creados.');

    // Vehículos de prueba (usuario_id 1 tiene 2 vehículos, usuario_id 2 tiene 1)
    await queryRunner.query(`
      INSERT INTO vehiculos (usuario_id, marca, modelo, anio, placa, combustible, kilometraje, unidad)
      VALUES
        (1, 'Toyota',   'Corolla',  2019, 'ABC-123', 'Gasolina', 85000, 'km'),
        (1, 'Honda',    'CR-V',     2021, 'DEF-456', 'Gasolina', 42000, 'km'),
        (2, 'Hyundai',  'Tucson',   2020, 'GHI-789', 'Diesel',   63000, 'km'),
        (3, 'Kia',      'Sportage', 2018, 'JKL-012', 'Gasolina', 110000,'km')
    `);
    console.log('Vehículos creados.');

    // Mantenimientos de prueba
    await queryRunner.query(`
      INSERT INTO mantenimientos (vehiculo_id, tipo, fecha, kilometraje, costo, notas, taller)
      VALUES
        (1, 'Cambio de aceite',       '2024-01-15', 75000, 45000,  'Aceite 5W-30 sintético, filtro nuevo',          'Taller Rodríguez'),
        (1, 'Revisión de frenos',     '2024-03-10', 78000, 85000,  'Se cambiaron pastillas delanteras',              'Taller Rodríguez'),
        (1, 'Cambio de llantas',      '2024-05-20', 82000, 180000, 'Llantas Bridgestone 195/65 R15',                'AutoServicio SA'),
        (1, 'Cambio de aceite',       '2024-09-05', 84500, 45000,  'Aceite 5W-30 sintético',                        'Taller Rodríguez'),
        (2, 'Cambio de aceite',       '2024-02-20', 38000, 50000,  'Aceite 0W-20 Honda original',                   'Agencia Honda'),
        (2, 'Revisión general',       '2024-06-15', 41000, 120000, 'Revisión de 40.000 km, todo en orden',          'Agencia Honda'),
        (3, 'Cambio de aceite',       '2024-01-08', 58000, 48000,  'Aceite Diesel 5W-40',                           'Taller Central'),
        (3, 'Cambio de filtro aire',  '2024-04-22', 61000, 25000,  'Filtro de aire y cabina reemplazados',          'Taller Central'),
        (3, 'Revisión de suspensión', '2024-07-30', 62500, 95000,  'Se ajustaron amortiguadores traseros',          'Mecánica Pérez'),
        (4, 'Cambio de aceite',       '2023-11-10', 100000,42000,  'Aceite 5W-40 semisintético',                    'Taller Kia'),
        (4, 'Distribución',           '2024-02-28', 105000,250000, 'Cambio de banda de distribución y tensor',      'Taller Kia'),
        (4, 'Cambio de batería',      '2024-08-14', 109000,75000,  'Batería Bosch 60Ah',                            'AutoRepuestos MX')
    `);
    console.log('Mantenimientos creados.');

    await queryRunner.commitTransaction();
    console.log('\nSeeds completados exitosamente.');
    console.log('Usuarios de prueba:');
    console.log('  carlos@autocheck.com / AutoCheck123!');
    console.log('  maria@autocheck.com  / AutoCheck123!');
    console.log('  juan@autocheck.com   / AutoCheck123!');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error en seeds:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed();
