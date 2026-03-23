// Conversiones
export const KM_A_MILLAS = 0.621371;
export const MILLAS_A_KM = 1.60934;

// Convertir km a la unidad del vehículo para mostrar
export const formatRecorrido = (km, unidad) => {
  if (!km && km !== 0) return '-';
  if (unidad === 'mi') {
    const millas = Math.round(km * KM_A_MILLAS);
    return `${millas.toLocaleString()} mi`;
  }
  return `${Number(km).toLocaleString()} km`;
};

// Convertir valor ingresado por el usuario a km para guardar
export const convertirAKm = (valor, unidad) => {
  if (!valor) return 0;
  if (unidad === 'mi') return Math.round(parseFloat(valor) * MILLAS_A_KM);
  return parseInt(valor);
};

// Convertir km a la unidad del vehículo para mostrar en inputs
export const convertirDeKm = (km, unidad) => {
  if (!km) return 0;
  if (unidad === 'mi') return Math.round(km * KM_A_MILLAS);
  return km;
};

// Límites de mantenimiento por tipo y unidad
export const LIMITES_MANTENIMIENTO = {
  aceite: { km: 5000, mi: 3000 },
  frenos: { km: 40000, mi: 25000 },
  llantas: { km: 60000, mi: 37000 },
  rotacion: { km: 10000, mi: 6000 },
  filtroAire: { km: 15000, mi: 9000 },
  general: { km: 20000, mi: 12000 },
  bateria: { km: 50000, mi: 31000 },
};

// Obtener límite según tipo de mantenimiento y unidad
export const getLimite = (tipo, unidad) => {
  const t = tipo?.toLowerCase() || '';
  if (t.includes('aceite')) return LIMITES_MANTENIMIENTO.aceite[unidad] || LIMITES_MANTENIMIENTO.aceite.km;
  if (t.includes('freno')) return LIMITES_MANTENIMIENTO.frenos[unidad] || LIMITES_MANTENIMIENTO.frenos.km;
  if (t.includes('llanta') || t.includes('neumatico')) return LIMITES_MANTENIMIENTO.llantas[unidad] || LIMITES_MANTENIMIENTO.llantas.km;
  if (t.includes('rotacion') || t.includes('rotación')) return LIMITES_MANTENIMIENTO.rotacion[unidad] || LIMITES_MANTENIMIENTO.rotacion.km;
  if (t.includes('filtro')) return LIMITES_MANTENIMIENTO.filtroAire[unidad] || LIMITES_MANTENIMIENTO.filtroAire.km;
  if (t.includes('general')) return LIMITES_MANTENIMIENTO.general[unidad] || LIMITES_MANTENIMIENTO.general.km;
  if (t.includes('bateria') || t.includes('batería')) return LIMITES_MANTENIMIENTO.bateria[unidad] || LIMITES_MANTENIMIENTO.bateria.km;
  return null;
};

// Calcular recorrido desde último mantenimiento en la unidad del vehículo
export const calcularRecorridoDesde = (kmActual, kmServicio, unidad) => {
  const kmDesde = (kmActual || 0) - (kmServicio || 0);
  return convertirDeKm(kmDesde, unidad);
};





// Generar alertas para un vehículo
export const generarAlertas = (vehiculo, mantenimientos) => {
  const alertas = [];
  const unidad = vehiculo.unidad || 'km';
  const kmActual = vehiculo.kilometraje || 0;
  const nombreVehiculo = `${vehiculo.marca} ${vehiculo.modelo}`;

  const tiposAVerificar = [
    { key: 'aceite', label: 'Cambio de Aceite', buscar: 'aceite' },
    { key: 'frenos', label: 'Revisión de Frenos', buscar: 'freno' },
    { key: 'llantas', label: 'Cambio de Llantas', buscar: 'llanta' },
    { key: 'rotacion', label: 'Rotación de Llantas', buscar: 'rotacion' },
    { key: 'filtroAire', label: 'Cambio de Filtro de Aire', buscar: 'filtro' },
    { key: 'bateria', label: 'Cambio de Batería', buscar: 'bateria' },
  ];

  for (const tipo of tiposAVerificar) {
    const limite = LIMITES_MANTENIMIENTO[tipo.key][unidad];
    const limiteAlerta = Math.round(limite * 0.85); // alerta al 85% del límite

    const ultimoServicio = mantenimientos.find(m =>
      m.tipo?.toLowerCase().includes(tipo.buscar)
    );

    if (ultimoServicio) {
      const recorridoDesde = calcularRecorridoDesde(kmActual, ultimoServicio.kilometraje, unidad);
      if (recorridoDesde >= limiteAlerta) {
        alertas.push({
          id: `${tipo.key}-${vehiculo.id}`,
          vehiculo: nombreVehiculo,
          tipo: tipo.label,
          mensaje: `${recorridoDesde.toLocaleString()} ${unidad} desde el último servicio (límite: ${limite.toLocaleString()} ${unidad})`,
          nivel: recorridoDesde >= limite ? 'alto' : 'medio',
          icono: 'warning',
          recorridoDesde,
          limite,
          unidad,
        });
      }
    } else {
      // Si nunca se hizo este mantenimiento y el vehículo ya pasó el límite
      const recorridoActual = convertirDeKm(kmActual, unidad);
      if (recorridoActual >= limite) {
        alertas.push({
          id: `${tipo.key}-nuevo-${vehiculo.id}`,
          vehiculo: nombreVehiculo,
          tipo: tipo.label,
          mensaje: `Sin registro de ${tipo.label.toLowerCase()} (${recorridoActual.toLocaleString()} ${unidad})`,
          nivel: 'alto',
          icono: 'warning',
          recorridoDesde: recorridoActual,
          limite,
          unidad,
        });
      }
    }
  }

  // Alerta por tiempo — más de 6 meses sin mantenimiento
  if (mantenimientos.length > 0 && mantenimientos[0].fecha) {
    const diasDesde = Math.floor(
      (new Date() - new Date(mantenimientos[0].fecha)) / (1000 * 60 * 60 * 24)
    );
    if (diasDesde >= 150) {
      alertas.push({
        id: `tiempo-${vehiculo.id}`,
        vehiculo: nombreVehiculo,
        tipo: 'Revisión General',
        mensaje: `Hace ${diasDesde} días sin mantenimiento registrado`,
        nivel: diasDesde >= 180 ? 'alto' : 'medio',
        icono: 'calendar-today',
      });
    }
  } else if (mantenimientos.length === 0) {
    alertas.push({
      id: `sin-mant-${vehiculo.id}`,
      vehiculo: nombreVehiculo,
      tipo: 'Sin Mantenimientos',
      mensaje: 'Este vehículo no tiene mantenimientos registrados',
      nivel: 'bajo',
      icono: 'info',
    });
  }


  

  return alertas;
};


// Calcular próximos mantenimientos recomendados
export const calcularProximosMantenimientos = (vehiculo, mantenimientos) => {
  const unidad = vehiculo.unidad || 'km';
  const kmActual = vehiculo.kilometraje || 0;
  const proximos = [];

  const tiposAVerificar = [
    { key: 'aceite', label: 'Cambio de Aceite', buscar: 'aceite' },
    { key: 'frenos', label: 'Revisión de Frenos', buscar: 'freno' },
    { key: 'llantas', label: 'Cambio de Llantas', buscar: 'llanta' },
    { key: 'rotacion', label: 'Rotación de Llantas', buscar: 'rotacion' },
    { key: 'filtroAire', label: 'Filtro de Aire', buscar: 'filtro' },
    { key: 'bateria', label: 'Cambio de Batería', buscar: 'bateria' },
  ];

  for (const tipo of tiposAVerificar) {
    const limite = LIMITES_MANTENIMIENTO[tipo.key][unidad];
    const ultimoServicio = mantenimientos.find(m =>
      m.tipo?.toLowerCase().includes(tipo.buscar)
    );

    let kmProximo;
    let recorridoDesde = 0;

    if (ultimoServicio) {
      const kmUltimo = ultimoServicio.kilometraje || 0;
      kmProximo = kmUltimo + (limite * (unidad === 'mi' ? MILLAS_A_KM : 1));
      recorridoDesde = calcularRecorridoDesde(kmActual, kmUltimo, unidad);
    } else {
      kmProximo = limite * (unidad === 'mi' ? MILLAS_A_KM : 1);
      recorridoDesde = convertirDeKm(kmActual, unidad);
    }

    const kmFaltantes = kmProximo - kmActual;
    const recorridoFaltante = convertirDeKm(Math.max(kmFaltantes, 0), unidad);
    const porcentaje = Math.min((recorridoDesde / limite) * 100, 100);

    proximos.push({
      tipo: tipo.label,
      recorridoFaltante,
      porcentaje,
      unidad,
      urgente: porcentaje >= 85,
      vencido: porcentaje >= 100,
    });
  }

  // Ordenar por porcentaje descendente
  return proximos.sort((a, b) => b.porcentaje - a.porcentaje);
};