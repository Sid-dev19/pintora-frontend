const { supabase, testConnection } = require('./config/db');

async function test() {
  console.log('Testing Supabase connection...');
  
  try {
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('\nAvailable public tables:');
    if (tables && tables.length > 0) {
      tables.forEach(table => console.log(`- ${table.tablename}`));
    } else {
      console.log('No tables found in the public schema');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    process.exit(0);
  }
}

test();
