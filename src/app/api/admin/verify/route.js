import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/utils/adminAuth';

export async function GET(request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  
  return NextResponse.json({ success: true });
}
