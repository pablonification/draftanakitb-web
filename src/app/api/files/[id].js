
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const { gfs } = await connectToDatabase();
        const file = await gfs.files.findOne({ _id: new require('mongodb').ObjectId(id) });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const readstream = gfs.createReadStream({ _id: file._id });
        return new Response(readstream, {
            headers: {
                'Content-Type': file.contentType,
                'Content-Disposition': `attachment; filename="${file.filename}"`,
            },
        });
    } catch (error) {
        console.error('File retrieval error:', error);
        return NextResponse.json(
            { error: 'File retrieval failed', details: error.message },
            { status: 500 }
        );
    }
}