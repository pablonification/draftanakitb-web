// Advertisement configuration
export const adsConfig = {
  // Global switch to enable/disable all ads
  enabled: false,

  // Configuration for different ad positions
  positions: {
    'main-top': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "Advertisement",
        description: "Main page top advertisement space",
        link: "https://draftanakitb.tech",
        imageUrl: "/og-image.jpg", // Using local image from public directory
      }
    },
    'main-bottom': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "Advertisement",
        description: "Main page bottom advertisement space",
        link: "https://draftanakitb.tech",
        imageUrl: "/og-image.jpg",
      }
    },
    'regular-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "Advertisement",
        description: "Regular landing page advertisement space",
        link: "https://draftanakitb.tech",
        imageUrl: "/og-image.jpg",
      }
    },
    'paid-landing': {
      enabled: true,
      type: 'banner',
      customContent: {
        title: "Advertisement",
        description: "Paid landing page advertisement space",
        link: "https://draftanakitb.tech",
        imageUrl: "/og-image.jpg",
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
      imageUrl: "/og-image.jpg", // Default image
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