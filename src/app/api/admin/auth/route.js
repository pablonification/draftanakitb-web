import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { ADMIN_CREDENTIALS } from '@/app/config/adminConfig';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const admin = ADMIN_CREDENTIALS.admins.find(
            admin => admin.username === username && admin.password === password
        );

        if (!admin) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        const token = generateToken({ 
            username: admin.username,
            name: admin.name
        });

        return NextResponse.json({ 
            success: true, 
            token,
            admin: { username: admin.username, name: admin.name }
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: 'Authentication failed' 
        }, { status: 500 });
    }
}
