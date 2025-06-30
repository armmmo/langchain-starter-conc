import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { processDocument } from '@/lib/embeddings';
import { isAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedDocuments = [];
    const teamId = session.user.teams?.[0]?.teamId; // Admin's primary team

    if (!teamId) {
      return NextResponse.json({ error: 'No team found for user' }, { status: 400 });
    }

    for (const file of files) {
      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/markdown',
      ];

      if (!allowedTypes.includes(file.type)) {
        continue; // Skip unsupported files
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue; // Skip files larger than 10MB
      }

      try {
        // Extract text content from file
        const text = await extractTextFromFile(file);
        
        // Create database record
        const [document] = await db.insert(documents).values({
          teamId,
          uploadedById: session.user.id,
          filename: `${Date.now()}-${file.name}`,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          content: text,
          isProcessed: false,
        }).returning();

        uploadedDocuments.push(document);

        // Process document asynchronously (generate embeddings)
        processDocument(document.id, text, teamId).catch(error => {
          console.error('Document processing error:', error);
        });

      } catch (error) {
        console.error('Error processing file:', file.name, error);
        continue; // Skip problematic files
      }
    }

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedDocuments.length,
      documents: uploadedDocuments,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const content = new TextDecoder().decode(buffer);

  // For now, we'll handle plain text files
  // In a production app, you'd want to add proper PDF, DOCX parsing
  if (file.type === 'text/plain' || file.type === 'text/markdown') {
    return content;
  }

  // For other file types, you would integrate with libraries like:
  // - pdf-parse for PDFs
  // - mammoth for DOCX files
  // - etc.
  
  // Placeholder for other file types
  return `Content extracted from ${file.name}\n\n${content}`;
}