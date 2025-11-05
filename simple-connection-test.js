require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Starting connection test...');

// Check if environment variables are loaded
console.log('\n📋 Environment Variables:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Found' : '❌ Missing'}`);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log('\n❌ Error: Missing required environment variables in .env file');
    process.exit(1);
}

// Test basic fetch to Supabase URL
async function testConnection() {
    console.log('\n🔄 Testing network connectivity to Supabase...');
    
    try {
        // Test basic HTTP connectivity
        const testUrl = process.env.SUPABASE_URL.replace('/rest/v1', ''); // Get base URL
        console.log(`Trying to connect to: ${testUrl}`);
        
        const response = await fetch(testUrl, {
            method: 'HEAD',
            timeout: 10000 // 10 second timeout
        });
        
        console.log(`✅ Successfully connected to Supabase! Status: ${response.status}`);
        
        // If we get here, basic connectivity is good
        testSupabaseClient();
        
    } catch (error) {
        console.error('\n❌ Network connection failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check your internet connection');
        console.log('2. Verify the Supabase URL is correct and accessible');
        console.log('3. Check if your network or firewall is blocking the connection');
        console.log('4. Try accessing the Supabase dashboard in your browser:', process.env.SUPABASE_URL);
    }
}

async function testSupabaseClient() {
    console.log('\n🔄 Testing Supabase client...');
    
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                auth: { persistSession: false },
                global: { fetch: fetch } // Use global fetch
            }
        );
        
        console.log('✅ Supabase client created successfully');
        
        // Test a simple query
        console.log('\n🔍 Testing database connection...');
        const { data, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .limit(1);
            
        if (error) throw error;
        
        console.log('✅ Successfully queried database!');
        console.log('\n🎉 All tests passed! Your Supabase connection is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Supabase client error:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Verify your Supabase project is active and running');
        console.log('2. Check if your Supabase key has the correct permissions');
        console.log('3. Make sure your IP is whitelisted in Supabase (check Row Level Security settings)');
        console.log('4. Check the Supabase status page: https://status.supabase.com/');
    }
}

// Start the test
testConnection();
