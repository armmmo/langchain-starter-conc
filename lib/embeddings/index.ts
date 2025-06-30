import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { db } from '../db';
import { documents, documentChunks } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export interface DocumentProcessingResult {
  success: boolean;
  chunksCreated?: number;
  error?: string;
}

export async function processDocument(
  documentId: string,
  content: string,
  teamId: string
): Promise<DocumentProcessingResult> {
  try {
    // Split the document into chunks
    const docs = await textSplitter.createDocuments([content]);
    
    // Generate embeddings for each chunk
    const chunks = [];
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const embedding = await embeddings.embedQuery(doc.pageContent);
      
      chunks.push({
        documentId,
        teamId,
        content: doc.pageContent,
        embedding: `[${embedding.join(',')}]`, // PostgreSQL array format
        metadata: doc.metadata,
        tokenCount: estimateTokenCount(doc.pageContent),
        chunkIndex: i,
      });
    }

    // Insert chunks into database
    await db.insert(documentChunks).values(chunks);

    // Update document as processed
    await db
      .update(documents)
      .set({ 
        isProcessed: true,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return {
      success: true,
      chunksCreated: chunks.length,
    };
  } catch (error) {
    console.error('Document processing error:', error);
    
    // Update document with error
    await db
      .update(documents)
      .set({ 
        processingError: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function searchSimilarChunks(
  query: string,
  teamId: string,
  limit: number = 5,
  threshold: number = 0.7
) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // Search for similar chunks using cosine similarity
    const results = await db.execute(sql`
      SELECT 
        c.id,
        c.content,
        c.metadata,
        c.chunk_index,
        d.filename,
        d.original_name,
        1 - (c.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
      FROM ${documentChunks} c
      INNER JOIN ${documents} d ON c.document_id = d.id
      WHERE c.team_id = ${teamId}
        AND d.is_processed = true
        AND 1 - (c.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) > ${threshold}
      ORDER BY c.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
      LIMIT ${limit}
    `);

    return results.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      chunkIndex: row.chunk_index,
      filename: row.filename,
      originalName: row.original_name,
      similarity: parseFloat(row.similarity),
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function generateRAGResponse(
  query: string,
  teamId: string,
  userId: string
): Promise<{
  response: string;
  sources: Array<{
    filename: string;
    content: string;
    similarity: number;
  }>;
}> {
  try {
    // Search for relevant chunks
    const relevantChunks = await searchSimilarChunks(query, teamId, 5, 0.7);
    
    if (relevantChunks.length === 0) {
      return {
        response: "I couldn't find any relevant information in your documents to answer this question.",
        sources: [],
      };
    }

    // Construct context from chunks
    const context = relevantChunks
      .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
      .join('\n\n');

    // Create prompt for RAG response
    const prompt = `Based on the following context from the user's documents, please answer their question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${context}

Question: ${query}

Please provide a comprehensive answer based only on the provided context. Include references to the source documents when relevant.`;

    // Generate response using OpenAI (you would integrate with your LangChain setup here)
    // For now, this is a placeholder - you'd use your existing chat functionality
    const response = `Based on your documents, here's what I found regarding "${query}":

${relevantChunks.length > 0 ? relevantChunks[0].content.substring(0, 200) + '...' : 'No relevant information found.'}

This information comes from ${relevantChunks.length} document(s) in your knowledge base.`;

    return {
      response,
      sources: relevantChunks.map(chunk => ({
        filename: chunk.originalName,
        content: chunk.content.substring(0, 200) + '...',
        similarity: chunk.similarity,
      })),
    };
  } catch (error) {
    console.error('RAG response error:', error);
    return {
      response: 'Sorry, I encountered an error while processing your request.',
      sources: [],
    };
  }
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  await db
    .delete(documentChunks)
    .where(eq(documentChunks.documentId, documentId));
}