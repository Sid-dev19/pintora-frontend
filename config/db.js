const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://trzhuqajzjkhmljrezoi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemh1cWFqempraG1sanJlem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc0NjYsImV4cCI6MjA3NDgyMzQ2Nn0.aVrCv8BJqW4PpQXkWNBKDL_jwx3avJcgYaRgWLnra8o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
  try {
    // Try to get the current user (works even if no tables exist)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Connection status:', user ? 'Authenticated' : 'Anonymous');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  testConnection
};
