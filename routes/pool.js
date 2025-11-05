
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.trzhuqajzjkhmljrezoi.supabase.co', // your Supabase host
  port: 5432, // default PostgreSQL port
  user: 'postgres', // Supabase default username
  password: 'Nitr0gen@', // the password you set when creating the Supabase project
  database: 'postgres', // default database name
  ssl: {
    rejectUnauthorized: false, // SSL required by Supabase
  },
});

module.exports = pool;
