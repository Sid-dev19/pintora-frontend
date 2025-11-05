require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase connection...\n');

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Error: Missing Supabase configuration in .env file');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

// Test connection
async function testConnection() {
    try {
        console.log('\n🔄 Testing Supabase connection...');
        
        // Test basic query
        const { data, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .limit(1);
            
        if (error) throw error;
        
        console.log('✅ Successfully connected to Supabase!');
        console.log('\n📋 Available tables in public schema:');
        if (data && data.length > 0) {
            data.forEach(table => console.log(`- ${table.tablename}`));
        } else {
            console.log('No tables found in the public schema');
        }
        
    } catch (error) {
        console.error('\n❌ Error connecting to Supabase:');
        console.error('Message:', error.message);
        console.error('Code:', error.code || 'N/A');
        
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify your .env file has correct SUPABASE_URL and SUPABASE_KEY');
        console.log('3. Check if your IP is whitelisted in Supabase (if using RLS)');
        console.log('4. Try accessing the Supabase dashboard in your browser:', supabaseUrl);
        
        process.exit(1);
    }
}

testConnection();
