export const validateFile = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  if (!file) return { valid: true };
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Ukuran file maksimal 5MB'
    };
  }

  return { valid: true };
};

export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
