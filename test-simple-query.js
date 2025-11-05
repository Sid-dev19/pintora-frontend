console.log('🔍 Testing Supabase connection with a simple query...\n');

// Import the configured Supabase client
const supabase = require('./config/supabase');

async function testConnection() {
    try {
        console.log('🔄 Testing connection to Supabase...');
        
        // Try a simple query to the health endpoint
        const { data, error } = await supabase
            .rpc('get_server_info');

        if (error) throw error;

        console.log('✅ Successfully connected to Supabase!');
        console.log('Server info:', data);
        
    } catch (error) {
        console.error('\n❌ Error connecting to Supabase:');
        console.error('Message:', error.message);
        
        if (error.code) console.error('Code:', error.code);
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify your .env file has correct SUPABASE_URL and SUPABASE_KEY');
        console.log('3. Check if your IP is whitelisted in Supabase (if using RLS)');
        console.log('4. Try accessing the Supabase dashboard in your browser');
        
        // Test direct fetch to Supabase
        try {
            console.log('\n🔄 Testing direct HTTP connection to Supabase...');
            const response = await fetch(process.env.SUPABASE_URL, {
                method: 'GET',
                headers: {
                    'apikey': process.env.SUPABASE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
                }
            });
            console.log(`HTTP Status: ${response.status} ${response.statusText}`);
        } catch (fetchError) {
            console.error('HTTP Connection failed:', fetchError.message);
            if (fetchError.cause) console.error('Cause:', fetchError.cause);
        }
        
        process.exit(1);
    }
}

// Run the test
testConnection();
