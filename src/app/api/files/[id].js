import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const { gfs } = await connectToDatabase();
        const file = await gfs.files.findOne({ _id: new ObjectId(id) });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const readstream = gfs.createReadStream({ _id: file._id });
        const buffers = [];

        readstream.on('data', (chunk) => {
            buffers.push(chunk);
        });

        readstream.on('end', () => {
            const buffer = Buffer.concat(buffers);
            return new Response(buffer, {
                headers: {
                    'Content-Type': file.contentType,
                    'Content-Disposition': `attachment; filename="${file.filename}"`,
                },
            });
        });

        readstream.on('error', (error) => {
            console.error('Readstream error:', error);
            return NextResponse.json(
                { error: 'File retrieval failed', details: error.message },
                { status: 500 }
            );
        });

    } catch (error) {
        console.error('File retrieval error:', error);
        return NextResponse.json(
            { error: 'File retrieval failed', details: error.message },
            { status: 500 }
        );
    }
}