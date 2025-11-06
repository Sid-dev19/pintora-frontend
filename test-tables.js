const { createClient } = require('@supabase/supabase-js');



// wsedfghjkl;
const supabaseUrl = 'https://trzhuqajzjkhmljrezoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemh1cWFqempraG1sanJlem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc0NjYsImV4cCI6MjA3NDgyMzQ2Nn0.aVrCv8BJqW4PpQXkWNBKDL_jwx3avJcgYaRgWLnra8o';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
});

async function listTables() {
  console.log('Fetching tables from Supabase...');

  try {
    // This is a raw SQL query to list tables in the public schema
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error('❌ Error executing query:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('\nAvailable tables:');
    if (data && data.length > 0) {
      data.forEach(table => console.log(`- ${table}`));
    } else {
      console.log('No tables found in the public schema');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  }
}

// Create the get_tables function if it doesn't exist
async function createGetTablesFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_tables()
    RETURNS TABLE (table_name text) AS $$
    BEGIN
      RETURN QUERY
      SELECT table_name::text
      FROM information_schema.tables
      WHERE table_schema = 'public';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { data, error } = await supabase.rpc('sql', { query: sql });
    if (error) throw error;
    console.log('✅ Created get_tables function');
    return true;
  } catch (error) {
    console.error('❌ Error creating function:', error.message);
    return false;
  }
}

async function main() {
  // First, try to create the function
  await createGetTablesFunction();
  
  // Then list the tables
  await listTables();
  
  process.exit(0);
}

main();
