import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, documentChunks, usage } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { processDocument as processDocumentEmbeddings } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = Array.from(formData.getAll('files')) as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedDocuments = [];
    const adminUserId = session.user.id;

    // Process each file
    for (const file of files) {
      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        continue; // Skip unsupported files
      }

      const content = await file.text();
      
      try {
        // Create database record
        const documentId = nanoid();
        const [document] = await db.insert(documents).values({
          id: documentId,
          userId: adminUserId, // Admin uploads for all users
          filename: `${Date.now()}-${file.name}`,
          contentType: file.type,
          size: file.size,
          content,
          metadata: JSON.stringify({
            originalName: file.name,
            uploadedBy: 'admin',
            uploadedAt: new Date().toISOString()
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        uploadedDocuments.push(document);

        // Process document asynchronously (generate embeddings)
        // Note: The embeddings function expects teamId but we'll use userId for now
        processDocumentEmbeddings(documentId, content, adminUserId).catch(error => {
          console.error('Document processing error:', error);
        });

      } catch (error) {
        console.error('Error uploading document:', error);
      }
    }

    // Track usage
    try {
      await db.insert(usage).values({
        id: nanoid(),
        userId: adminUserId,
        type: 'document_upload',
        count: uploadedDocuments.length,
        date: new Date(),
        metadata: JSON.stringify({
          filenames: uploadedDocuments.map(d => d.filename),
          source: 'admin_upload'
        })
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments,
      count: uploadedDocuments.length
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}