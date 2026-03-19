export const getBrandImage = (marca) => {
  if (!marca) return null;

  const dominios = {
    toyota: 'toyota.com',
    honda: 'honda.com',
    nissan: 'nissan.com',
    hyundai: 'hyundai.com',
    kia: 'kia.com',
    mazda: 'mazda.com',
    ford: 'ford.com',
    chevrolet: 'chevrolet.com',
    volkswagen: 'vw.com',
    bmw: 'bmw.com',
    mercedes: 'mercedes-benz.com',
    audi: 'audi.com',
    suzuki: 'suzuki.com',
    mitsubishi: 'mitsubishi-motors.com',
    subaru: 'subaru.com',
    jeep: 'jeep.com',
    dodge: 'dodge.com',
    tesla: 'tesla.com',
    volvo: 'volvocars.com',
    peugeot: 'peugeot.com',
    renault: 'renault.com',
    fiat: 'fiat.com',
    porsche: 'porsche.com',
    lexus: 'lexus.com',
    acura: 'acura.com',
    chery: 'chery.com',
    byd: 'byd.com',
    ram: 'ramtrucks.com',
  };

  const key = marca.toLowerCase().trim().split(' ')[0];
  const dominio = dominios[key];
  if (!dominio) return null;
  return `https://img.logo.dev/${dominio}?token=pk_SzAoMEgBR8Cfo9GrENHPpQ`;
};

export const getBrandColor = (marca) => {
  const colores = {
    toyota: '#EB0A1E',
    honda: '#CC0000',
    nissan: '#C3002F',
    hyundai: '#002C5F',
    kia: '#05141F',
    mazda: '#1E3A5F',
    ford: '#003087',
    chevrolet: '#D4A017',
    volkswagen: '#001E50',
    bmw: '#0066B1',
    mercedes: '#222222',
    audi: '#BB0A21',
    suzuki: '#004A97',
    mitsubishi: '#CE0000',
    subaru: '#003399',
    jeep: '#1F4E2E',
    tesla: '#CC0000',
    volvo: '#003057',
    porsche: '#8B0000',
    lexus: '#1A1A1A',
    chery: '#CC0000',
    byd: '#1B5E9B',
  };
  if (!marca) return '#5B2EE8';
  const key = marca.toLowerCase().trim().split(' ')[0];
  return colores[key] || '#5B2EE8';
};