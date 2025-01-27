export const validateFile = async (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for videos
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images
  
  const ALLOWED_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif'],
    videos: ['video/mp4']
  };

  if (!file) return { valid: true };
  
  console.log('Starting file validation:', {
    type: file.type,
    size: file.size,
    name: file.name
  });

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
  console.log('Starting video validation:', {
    type: file.type,
    size: file.size,
    name: file.name
  });

  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      console.warn('Invalid video type:', file.type);
      resolve({
        valid: false,
        error: 'File bukan video yang valid'
      });
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      console.log('Video metadata loaded:', {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      
      window.URL.revokeObjectURL(video.src);
      
      if (video.duration > 60) {
        console.warn('Video too long:', video.duration);
        resolve({
          valid: false,
          error: 'Durasi video maksimal 60 detik'
        });
        return;
      }

      if (video.videoWidth > 1280 || video.videoHeight > 720) {
        console.warn('Video resolution too high:', {
          width: video.videoWidth,
          height: video.videoHeight
        });
        resolve({
          valid: false,
          error: 'Resolusi video maksimal 1280x720 (720p)'
        });
        return;
      }

      console.log('Video validation successful');
      resolve({ valid: true });
    };

    video.onerror = () => {
      console.error('Video loading error:', video.error);
      window.URL.revokeObjectURL(video.src);
      resolve({
        valid: false,
        error: 'Format video tidak valid atau rusak'
      });
    };

    try {
      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating video URL:', error);
      resolve({
        valid: false,
        error: 'Gagal memproses video'
      });
    }
  });
};

// Add helper function to check if file is a video
export const isVideoFile = (file) => {
  const ALLOWED_VIDEO_TYPES = ['video/mp4'];
  return file && ALLOWED_VIDEO_TYPES.includes(file.type);
};
