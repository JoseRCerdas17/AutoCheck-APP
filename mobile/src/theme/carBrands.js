export const getBrandImage = (marca) => {
  if (!marca) return null;

  const logos = {
    toyota: 'https://cdn.brandfetch.io/idtCM9GLNB/w/400/h/400/theme/dark/icon.png',
    honda: 'https://cdn.brandfetch.io/idKLgFQMrD/w/400/h/400/theme/dark/icon.png',
    nissan: 'https://cdn.brandfetch.io/id_NizJVkX/w/400/h/400/theme/dark/icon.png',
    hyundai: 'https://cdn.brandfetch.io/idP_JwVdnj/w/400/h/400/theme/dark/icon.png',
    kia: 'https://cdn.brandfetch.io/idz5GKkSBc/w/400/h/400/theme/dark/icon.png',
    mazda: 'https://cdn.brandfetch.io/idRvEd-EUw/w/400/h/400/theme/dark/icon.png',
    ford: 'https://cdn.brandfetch.io/idCIar7_V-/w/400/h/400/theme/dark/icon.png',
    chevrolet: 'https://cdn.brandfetch.io/idG0TIxDNl/w/400/h/400/theme/dark/icon.png',
    volkswagen: 'https://cdn.brandfetch.io/id5mFTRroP/w/400/h/400/theme/dark/icon.png',
    bmw: 'https://cdn.brandfetch.io/idOlFGKwFv/w/400/h/400/theme/dark/icon.png',
    mercedes: 'https://cdn.brandfetch.io/idwSMoYVN0/w/400/h/400/theme/dark/icon.png',
    audi: 'https://cdn.brandfetch.io/idaJCeNVuC/w/400/h/400/theme/dark/icon.png',
    suzuki: 'https://cdn.brandfetch.io/id-lq_LSYD/w/400/h/400/theme/dark/icon.png',
    mitsubishi: 'https://cdn.brandfetch.io/idCNQJCPSs/w/400/h/400/theme/dark/icon.png',
    subaru: 'https://cdn.brandfetch.io/idKFDxhvdM/w/400/h/400/theme/dark/icon.png',
    jeep: 'https://cdn.brandfetch.io/idVPSxf9um/w/400/h/400/theme/dark/icon.png',
    tesla: 'https://cdn.brandfetch.io/id2C_5HLNH/w/400/h/400/theme/dark/icon.png',
    volvo: 'https://cdn.brandfetch.io/idXFHFrBKL/w/400/h/400/theme/dark/icon.png',
    porsche: 'https://cdn.brandfetch.io/idDzxMjCOd/w/400/h/400/theme/dark/icon.png',
    lexus: 'https://cdn.brandfetch.io/idubF3HFGQ/w/400/h/400/theme/dark/icon.png',
  };

  const key = marca.toLowerCase().trim().split(' ')[0];
  return logos[key] || null;
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