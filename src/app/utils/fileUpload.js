export const validateFile = async (file) => {
  const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

  const ALLOWED_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif'],
    videos: ['video/mp4']
  };

  if (!file) return { valid: true };
  
  const isVideo = file.type.startsWith('video/');
  const isImage = ALLOWED_TYPES.images.includes(file.type);
  
  if (!isVideo && !isImage) {
    return {
      valid: false,
      error: 'File type not supported'
    };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (max ${maxSize/1024/1024}MB)`
    };
  }

  if (isVideo) {
    return validateVideoFile(file);
  }

  return { valid: true };
};

const validateVideoFile = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      
      if (video.duration > 60) {
        resolve({
          valid: false,
          error: 'Video must be 60 seconds or less'
        });
        return;
      }

      resolve({ valid: true });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Invalid video file'
      });
    };

    video.src = url;
  });
};

export const processFile = async (file) => {
  if (!file) return null;

  const chunkSize = 1024 * 1024; // 1MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  let processedFile = '';

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const base64Chunk = await readChunkAsBase64(chunk);
    processedFile += base64Chunk;
  }

  return `data:${file.type};base64,${processedFile}`;
};

const readChunkAsBase64 = (chunk) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(chunk);
  });
};

export const isVideoFile = (file) => {
  const ALLOWED_VIDEO_TYPES = ['video/mp4'];
  return file && ALLOWED_VIDEO_TYPES.includes(file.type);
};
