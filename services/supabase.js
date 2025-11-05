const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

// Test the connection
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .limit(1);
            
        if (error) throw error;
        return { connected: true, message: 'Successfully connected to Supabase' };
    } catch (error) {
        return { 
            connected: false, 
            message: 'Failed to connect to Supabase',
            error: error.message 
        };
    }
}

module.exports = {
    supabase,
    testConnection
};
