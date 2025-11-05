const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://trzhuqajzjkhmljrezoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemh1cWFqempraG1sanJlem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc0NjYsImV4cCI6MjA3NDgyMzQ2Nn0.aVrCv8BJqW4PpQXkWNBKDL_jwx3avJcgYaRgWLnra8o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try to get the server timestamp
    const { data, error } = await supabase.rpc('now');
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Server response:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    process.exit(0);
  }
}

test();
