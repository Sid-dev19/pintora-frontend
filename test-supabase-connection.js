require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase configuration in .env file');
    console.log('\nPlease make sure your .env file contains:');
    console.log('SUPABASE_URL=your_supabase_project_url');
    console.log('SUPABASE_KEY=your_supabase_anon_key\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');
    
    try {
        // Test basic connection
        console.log('🔄 Testing connection to Supabase...');
        const { data, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

        if (error) throw error;

        console.log('✅ Successfully connected to Supabase!\n');
        
        // List all tables
        console.log('📋 Available tables in public schema:');
        if (data && data.length > 0) {
            data.forEach(table => console.log(`- ${table.tablename}`));
        } else {
            console.log('No tables found in the public schema');
        }
        
        // Test a sample query on the category table if it exists
        if (data.some(t => t.tablename === 'category')) {
            console.log('\n🔍 Testing category table...');
            const { data: categories, error: catError } = await supabase
                .from('category')
                .select('*')
                .limit(2);
                
            if (catError) throw catError;
            
            console.log('✅ Category table is accessible');
            console.log('📝 Sample categories:', 
                categories.map(c => ({ 
                    id: c.id || c.categoryid, 
                    name: c.categoryname || c.name 
                }))
            );
        }
        
    } catch (error) {
        console.error('\n❌ Error connecting to Supabase:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if your Supabase project is running');
        console.log('2. Verify your .env file has correct SUPABASE_URL and SUPABASE_KEY');
        console.log('3. Ensure your IP is whitelisted in Supabase (if using RLS)');
        console.log('4. Check your internet connection');
        
        process.exit(1);
    }
}

testConnection();
