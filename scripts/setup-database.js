const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Enable pgvector extension
    console.log('Enabling pgvector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension enabled successfully');

    // Verify extension is enabled
    const result = await client.query("SELECT * FROM pg_extension WHERE extname = 'vector';");
    if (result.rows.length > 0) {
      console.log('✅ pgvector extension is active');
      console.log('Extension details:', result.rows[0]);
    } else {
      console.log('❌ pgvector extension not found');
    }

  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

setupDatabase();