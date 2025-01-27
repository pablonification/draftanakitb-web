export const validateFile = async (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for videos
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images
  
  const ALLOWED_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif'],
    videos: ['video/mp4']
  };

  if (!file) return { valid: true };
  
  const isVideo = ALLOWED_TYPES.videos.includes(file.type);
  const isImage = ALLOWED_TYPES.images.includes(file.type);
  
  if (!isVideo && !isImage) {
    return {
      valid: false,
      error: 'Hanya file gambar (JPG, PNG, GIF) dan video (MP4) yang diperbolehkan'
    };
  }

  const maxSize = isVideo ? MAX_FILE_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Ukuran file maksimal ${isVideo ? '5MB untuk video' : '1MB untuk gambar'}`
    };
  }

  if (isVideo) {
    // For videos, we need to check both size and validity
    const videoCheck = await validateVideo(file);
    if (!videoCheck.valid) {
      return videoCheck;
    }
    
    // Additional size check for video after validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Ukuran video maksimal 5MB'
      };
    }
  }

  return { valid: true };
};

const validateVideo = (file) => {
  return new Promise((resolve) => {
    // First check if it's actually a video file
    if (!file.type.startsWith('video/')) {
      resolve({
        valid: false,
        error: 'File bukan video yang valid'
      });
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      // Check video duration (max 60 seconds)
      if (video.duration > 60) {
        resolve({
          valid: false,
          error: 'Durasi video maksimal 60 detik'
        });
        return;
      }

      // Check video dimensions (max 1280x720)
      if (video.videoWidth > 1280 || video.videoHeight > 720) {
        resolve({
          valid: false,
          error: 'Resolusi video maksimal 1280x720 (720p)'
        });
        return;
      }

      resolve({ valid: true });
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        valid: false,
        error: 'Format video tidak valid atau rusak'
      });
    };

    try {
      video.src = URL.createObjectURL(file);
    } catch (error) {
      resolve({
        valid: false,
        error: 'Gagal memproses video'
      });
    }
  });
};

export const convertFileToBase64 = async (file) => {
  if (!file) return null;

  // For videos, ensure we're handling them correctly
  if (file.type.startsWith('video/')) {
    try {
      // Read as array buffer first for videos
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:${file.type};base64,${base64}`;
    } catch (error) {
      console.error('Error converting video to base64:', error);
      throw new Error('Gagal memproses video');
    }
  }

  // For other files (images), use the existing method
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Add helper function to check if file is a video
export const isVideoFile = (file) => {
  const ALLOWED_VIDEO_TYPES = ['video/mp4'];
  return file && ALLOWED_VIDEO_TYPES.includes(file.type);
};
