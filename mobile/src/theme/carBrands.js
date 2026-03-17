export const carBrands = {
    toyota: 'https://www.carlogos.org/car-logos/toyota-logo-2019-3700x1200.png',
    honda: 'https://www.carlogos.org/car-logos/honda-logo-1700x1700.png',
    nissan: 'https://www.carlogos.org/car-logos/nissan-logo-2020-black-show.png',
    hyundai: 'https://www.carlogos.org/car-logos/hyundai-logo-2011-download.png',
    kia: 'https://www.carlogos.org/car-logos/kia-logo-2021-download.png',
    mazda: 'https://www.carlogos.org/car-logos/mazda-logo-2018-show.png',
    ford: 'https://www.carlogos.org/car-logos/ford-logo-2017-download.png',
    chevrolet: 'https://www.carlogos.org/car-logos/chevrolet-logo-2013-download.png',
    volkswagen: 'https://www.carlogos.org/car-logos/volkswagen-logo-2019-download.png',
    bmw: 'https://www.carlogos.org/car-logos/bmw-logo-2020-gray.png',
    mercedes: 'https://www.carlogos.org/car-logos/mercedes-benz-logo-2011-download.png',
    audi: 'https://www.carlogos.org/car-logos/audi-logo-2016-download.png',
    suzuki: 'https://www.carlogos.org/car-logos/suzuki-logo-2000-download.png',
    mitsubishi: 'https://www.carlogos.org/car-logos/mitsubishi-logo-2000-download.png',
  };
  
  export const getBrandImage = (marca) => {
    if (!marca) return null;
    const key = marca.toLowerCase().trim();
    return carBrands[key] || null;
  };