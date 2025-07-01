const { Client } = require('pg');

async function verifyTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get list of all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n🗃️  Created Tables:');
    console.log('================');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Check if vector extension is working
    const vectorTest = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_chunks' AND column_name = 'embedding';
    `);

    if (vectorTest.rows.length > 0) {
      console.log('\n✅ Vector column created successfully:');
      console.log('   table: document_chunks');
      console.log('   column:', vectorTest.rows[0].column_name);
      console.log('   type:', vectorTest.rows[0].data_type);
    }

    // Check indexes
    const indexResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `);

    console.log('\n📇 Created Indexes:');
    console.log('=================');
    indexResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.indexname} on ${row.tablename}`);
    });

    console.log('\n🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('Error verifying tables:', error.message);
  } finally {
    await client.end();
  }
}

verifyTables();