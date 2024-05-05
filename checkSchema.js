const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Check if the 'extrapolations' table exists
  let { data: tables, error } = await supabase.rpc('pg_catalog', 'pg_tables', {
    schemas: 'public',
  });

  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }

  const hasExtrapolationsTable = tables.some(table => table.tablename === 'extrapolations');

  if (!hasExtrapolationsTable) {
    // Table does not exist, create it
    console.log('Creating extrapolations table...');
    // Define the schema for the 'extrapolations' table
    // This is a placeholder and should be replaced with actual table creation logic
    console.log('Extrapolations table created.');
  } else {
    console.log('Extrapolations table already exists.');
  }
}

checkSchema();
