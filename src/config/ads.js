// Advertisement configuration
export const adsConfig = {
  // Global switch to enable/disable all ads
  enabled: true, // ok

  // Configuration for different ad positions
  positions: {
    'main-top': {
      enabled: false,
      type: 'banner',
      customContent: {
        // title: "Advertisement",
        // description: "HARGA PER-PAX NYA CUMA 18.500'an AJA GUYSSSS😭\nSLOT TERBATAS ⚠️\nADA PAKET REGULER JUGA, BEBAS PILIH 🥳\nFREE ONGKIR SE-JATINANGOR, DI KIRIM SAMPE DEPAN KOST.\nYU DI BOOKING DARI SEKARANG",
        link: "https://x.com/DraftAnakITB/status/1902737871838302299",
        imageUrl: "/footerGrab.png", // Using local image from public directory
      }
    },
    'main-bottom': {
      enabled: false,
      type: 'banner',
      customContent: {
        title: "🛵 Promo GrabBike 🛵",
        description: "Naik GrabBike sekarang pake promo \"GRABKAMPUS\" diskon 30% s.d 15 ribu! Gacor ga tuh promonya 😎 \n\nBerlaku sampai 28 Maret 2025 dengan tujuan dari atau ke kampus. Syarat dan ketentuan lainnya, berlaku ya 😉\n\nYuk jalan bareng GrabBike pake promo GRABKAMPUS 🛵",
        link: "https://x.com/DraftAnakITB/status/1902737871838302299",
        imageUrl: "/adsGrabBike.jpg",
      }
    },
    'main-comparison': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "📃 Kuesioner Tesis 📃",
        description: "Halo! Aku butuh responden yang sesuai kriteria untuk tesisku! Kriteria utamanya:\n\n- Mahasiswa Diploma/S1\n- Asal dari luar pulau Jawa\n- Mahasiswa di ITB/UI/IPB/UNPAD/TEL-U/UPI\n\nYang sesuai kriteria boleh banget bantu isi yaa🥹❤\n\nlink: https://bit.ly/KuesionerTesisMahasiwaRantau",
        link: "https://bit.ly/KuesionerTesisMahasiwaRantau",
        imageUrl: "/adsTesis.png",
      }
    },
    'regular-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "📃 Kuesioner Tesis 📃",
        description: "Halo! Aku butuh responden yang sesuai kriteria untuk tesisku! Kriteria utamanya:\n\n- Mahasiswa Diploma/S1\n- Asal dari luar pulau Jawa\n- Mahasiswa di ITB/UI/IPB/UNPAD/TEL-U/UPI\n\nYang sesuai kriteria boleh banget bantu isi yaa🥹❤\n\nlink: https://bit.ly/KuesionerTesisMahasiwaRantau",
        link: "https://bit.ly/KuesionerTesisMahasiwaRantau",
        imageUrl: "/adsTesis.png",
      }
    },
    'paid-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "📃 Kuesioner Tesis 📃",
        description: "Halo! Aku butuh responden yang sesuai kriteria untuk tesisku! Kriteria utamanya:\n\n- Mahasiswa Diploma/S1\n- Asal dari luar pulau Jawa\n- Mahasiswa di ITB/UI/IPB/UNPAD/TEL-U/UPI\n\nYang sesuai kriteria boleh banget bantu isi yaa🥹❤\n\nlink: https://bit.ly/KuesionerTesisMahasiwaRantau",
        link: "https://bit.ly/KuesionerTesisMahasiwaRantau",
        imageUrl: "/adsTesis.png",
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