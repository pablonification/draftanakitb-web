import jwt from 'jsonwebtoken';
const { ADMIN_CREDENTIALS } = require('@/app/config/adminConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const verifyAdminToken = (token) => {
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return ADMIN_CREDENTIALS.admins.some(
      admin => admin.username === decoded.username
    );
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const requireAdmin = async (request) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token || !verifyAdminToken(token)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
};
