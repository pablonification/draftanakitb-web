import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only apply to /payment endpoint
  if (request.nextUrl.pathname === '/payment') {
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
  matcher: '/payment'
};
// bruh