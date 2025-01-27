import { NextResponse } from 'next/server';

export function middleware(request) {
  // Apply to both payment and upload endpoints
  if (request.nextUrl.pathname === '/payment' || request.nextUrl.pathname === '/api/upload') {
    return NextResponse.next({
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Transfer-Encoding': 'chunked'
      }
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/payment', '/api/upload']
};
// bruh