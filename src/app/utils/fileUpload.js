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

const CHUNK_SIZE = 512 * 1024; // 512KB

export async function uploadFileInChunks(file) {
  if (!file) return null;

  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  let fileId = null;

  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    const base64Chunk = await readAsBase64(chunk);

    const res = await fetch('/api/upload-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        chunkIndex: i,
        chunkCount,
        chunkData: base64Chunk,
        fileType: file.type
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to upload chunk ${i + 1}`);
    }

    const data = await res.json();
    fileId = data.fileId; // store the fileId
    if (data.merged) {
      return { fileId, fileType: data.fileType };
    }
  }

  return null;
}

function readAsBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is data:...base64,...
      resolve(reader.result.split(',')[1]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

export const isVideoFile = (file) => {
  const ALLOWED_VIDEO_TYPES = ['video/mp4'];
  return file && ALLOWED_VIDEO_TYPES.includes(file.type);
};
