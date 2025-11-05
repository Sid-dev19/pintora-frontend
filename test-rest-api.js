require('dotenv').config();
const fetch = require('node-fetch');

async function testRestApi() {
    const url = `${process.env.SUPABASE_URL}/rest/v1/`;
    
    console.log(`Testing connection to: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
            }
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response:', text);
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testRestApi();
