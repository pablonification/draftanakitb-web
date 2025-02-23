import { NextResponse } from 'next/server';

// This route will handle callbacks at /api/payment/callback
export async function POST(request) {
    try {
        console.log('=== XENDIT CALLBACK RECEIVED AT /api/payment/callback ===');
        
        if (!process.env.XENDIT_CALLBACK_URL) {
            throw new Error('XENDIT_CALLBACK_URL environment variable is not set');
        }

        console.log('Forwarding to:', process.env.XENDIT_CALLBACK_URL);
        
        // Forward the request to the main callback handler
        const response = await fetch(process.env.XENDIT_CALLBACK_URL, {
            method: 'POST',
            headers: {
                ...Object.fromEntries(request.headers),
                'x-forwarded-from': '/api/payment/callback'
            },
            body: request.body
        });

        // Return the response from the main handler
        const data = await response.json();
        return NextResponse.json(data, {
            status: response.status,
            headers: Object.fromEntries(response.headers)
        });
    } catch (error) {
        console.error('Error forwarding callback:', error);
        // Still return 200 to acknowledge webhook
        return NextResponse.json({ 
            success: false, 
            error: 'Error forwarding callback',
            details: error.message 
        });
    }
} 