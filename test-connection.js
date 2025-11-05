console.log('🔍 Testing Supabase connection...\n');

// Import the configured Supabase client
const supabase = require('./config/supabase');

async function testConnection() {
    try {
        console.log('🔄 Testing connection to Supabase...');
        
        // Test a simple query to list tables
        const { data: tables, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

        if (error) throw error;

        console.log('✅ Successfully connected to Supabase!\n');
        
        // List available tables
        console.log('📋 Available tables in public schema:');
        if (tables && tables.length > 0) {
            tables.forEach(table => console.log(`- ${table.tablename}`));
        } else {
            console.log('No tables found in the public schema');
        }
        
        // Test a sample query if there are tables
        if (tables && tables.length > 0) {
            const sampleTable = tables[0].tablename;
            console.log(`\n🔍 Testing query on table: ${sampleTable}`);
            
            const { data: sampleData, error: queryError } = await supabase
                .from(sampleTable)
                .select('*')
                .limit(2);
                
            if (queryError) {
                console.log(`⚠️ Could not query ${sampleTable}:`, queryError.message);
            } else {
                console.log(`✅ Successfully queried ${sampleTable}`);
                console.log('Sample data:', JSON.stringify(sampleData, null, 2));
            }
        }
        
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
        
        process.exit(1);
    }
}

// Run the test
testConnection();
