import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${uuidv4()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure uploads directory exists (this would be handled by your deployment environment)
    try {
      await writeFile(path.join(uploadDir, filename), buffer);
    } catch (error) {
      console.error('Error writing file:', error);
      // If directory doesn't exist or is not writable, return error
      return NextResponse.json(
        { error: 'Failed to upload file. Upload directory may not exist.' },
        { status: 500 }
      );
    }

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        imageUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 