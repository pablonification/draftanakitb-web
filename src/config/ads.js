// Advertisement configuration
export const adsConfig = {
  // Global switch to enable/disable all ads
  enabled: true, // ok

  // Configuration for different ad positions
  positions: {
    'main-top': {
      enabled: true,
      type: 'banner',
      customContent: {
        // title: "Advertisement",
        // description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://x.com/DraftAnakITB/status/1900065538472316977",
        imageUrl: "/footerEdelweiss.png", // Using local image from public directory
      }
    },
    'main-bottom': {
      enabled: false,
      type: 'banner',
      customContent: {
        title: "☕ Edelweiss Coffee Jatinangor ☕",
        description: "Bingung cari menu bukber?\nEdelweiss Coffee Jatinangor punya paket bundling spesial Ramadan yang pas banget buat kamu!\nYuk, langsung langsung reservasi sekarang 0811211366",
        link: "https://x.com/DraftAnakITB/status/1900065538472316977",
        imageUrl: "/adsEdelweiss.jpg",
      }
    },
    'main-comparison': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "☕ Edelweiss Coffee Jatinangor ☕",
        description: "Bingung cari menu bukber?\nEdelweiss Coffee Jatinangor punya paket bundling spesial Ramadan yang pas banget buat kamu!\nYuk, langsung langsung reservasi sekarang 0811211366",
        link: "https://x.com/DraftAnakITB/status/1900065538472316977",
        imageUrl: "/adsEdelweiss.jpg",
      }
    },
    'regular-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "☕ Edelweiss Coffee Jatinangor ☕",
        description: "Bingung cari menu bukber?\nEdelweiss Coffee Jatinangor punya paket bundling spesial Ramadan yang pas banget buat kamu!\nYuk, langsung langsung reservasi sekarang 0811211366",
        link: "https://x.com/DraftAnakITB/status/1900065538472316977",
        imageUrl: "/adsEdelweiss.jpg",
      }
    },
    'paid-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "☕ Edelweiss Coffee Jatinangor ☕",
        description: "Bingung cari menu bukber?\nEdelweiss Coffee Jatinangor punya paket bundling spesial Ramadan yang pas banget buat kamu!\nYuk, langsung langsung reservasi sekarang 0811211366",
        link: "https://x.com/DraftAnakITB/status/1900065538472316977",
        imageUrl: "/adsEdelweiss.jpg",
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