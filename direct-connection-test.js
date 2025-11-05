require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

console.log('🚀 Starting direct connection test...\n');

// 1. Check if environment variables are loaded
console.log('🔍 Checking environment variables:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Found' : '❌ Missing'}\n`);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ Error: Missing required environment variables');
    process.exit(1);
}

// 2. Test basic HTTP connection to Supabase
async function testHttpConnection() {
    console.log('🌐 Testing HTTP connection to Supabase...');
    
    try {
        const response = await fetch(process.env.SUPABASE_URL, {
            method: 'HEAD',
            timeout: 10000
        });
        
        console.log(`✅ HTTP Connection: Success! Status: ${response.status}`);
        return true;
    } catch (error) {
        console.error('❌ HTTP Connection Failed:', error.message);
        console.log('\n🔧 Possible network issues:');
        console.log('1. Check your internet connection');
        console.log('2. Try pinging the Supabase URL in your terminal:');
        console.log(`   ping ${new URL(process.env.SUPABASE_URL).hostname}`);
        console.log('3. Try accessing the URL in your browser:', process.env.SUPABASE_URL);
        console.log('4. Check if your network or firewall is blocking the connection');
        return false;
    }
}

// 3. Test Supabase client initialization
function testSupabaseClient() {
    console.log('\n🔌 Testing Supabase client initialization...');
    
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                auth: { persistSession: false },
                global: { fetch: fetch },
                db: { schema: 'public' }
            }
        );
        
        console.log('✅ Supabase client initialized successfully');
        return supabase;
    } catch (error) {
        console.error('❌ Supabase client initialization failed:', error.message);
        return null;
    }
}

// 4. Run the tests
async function runTests() {
    // Test HTTP connection first
    const httpSuccess = await testHttpConnection();
    if (!httpSuccess) {
        console.log('\n❌ Cannot proceed with further tests due to HTTP connection failure');
        process.exit(1);
    }
    
    // Test Supabase client
    const supabase = testSupabaseClient();
    if (!supabase) {
        console.log('\n❌ Cannot proceed with database tests due to client initialization failure');
        process.exit(1);
    }
    
    // If we get here, basic connection is good
    console.log('\n🎉 Basic connection tests passed!');
    console.log('\nNext steps:');
    console.log('1. Try running your application again');
    console.log('2. If you still face issues, check your Supabase project settings');
    console.log('3. Make sure your IP is whitelisted in Supabase (if using RLS)');
}

// Run the tests
runTests().catch(console.error);
