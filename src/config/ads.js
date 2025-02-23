// Advertisement configuration
export const adsConfig = {
  // Global switch to enable/disable all ads
  enabled: true,

  // Configuration for different ad positions
  positions: {
    'main-top': {
      enabled: false,
      type: 'banner',
      customContent: {
        title: "✨ OPEN PRE-ORDER PAKET HEMAT CATERING RAMADHAN ✨",
        description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://wa.me/6283197457289",
        imageUrl: "/ads2.jpg", // Using local image from public directory
      }
    },
    'main-bottom': {
      enabled: false,
      type: 'banner',
      customContent: {
        title: "✨ OPEN PRE-ORDER PAKET HEMAT CATERING RAMADHAN ✨",
        description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://wa.me/6283197457289",
        imageUrl: "/ads2.jpg",
      }
    },
    'main-comparison': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "✨ OPEN PRE-ORDER PAKET HEMAT CATERING RAMADHAN ✨",
        description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://wa.me/6283197457289",
        imageUrl: "/ads2.jpg"
      }
    },
    'regular-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "✨ OPEN PRE-ORDER PAKET HEMAT CATERING RAMADHAN ✨",
        description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://wa.me/6283197457289",
        imageUrl: "/ads1.png"
      }
    },
    'paid-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "✨ OPEN PRE-ORDER PAKET HEMAT CATERING RAMADHAN ✨",
        description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://wa.me/6283197457289",
        imageUrl: "/ads1.png"
      }
    },
  },

  // Default ad configuration
  defaultConfig: {
    enabled: true,
    type: 'banner',
    customContent: {
      title: "Advertisement",
      description: "Advertisement space",
      link: "",
      imageUrl: "/og-image.jpg" // Default image
    }
  }
};

// Helper function to check if ads are enabled for a specific position
export const isAdEnabled = (position) => {
  if (!adsConfig.enabled) return false;
  
  const positionConfig = adsConfig.positions[position];
  if (!positionConfig) return adsConfig.defaultConfig.enabled;
  
  return positionConfig.enabled;
};

// Helper function to get ad configuration for a position
export const getAdConfig = (position) => {
  if (!isAdEnabled(position)) return null;
  
  const positionConfig = adsConfig.positions[position] || adsConfig.defaultConfig;
  return {
    ...adsConfig.defaultConfig,
    ...positionConfig,
  };
}; 