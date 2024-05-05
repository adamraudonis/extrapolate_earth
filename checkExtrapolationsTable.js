const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExtrapolationsTable() {
  // Fetch the list of tables in the public schema
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }

  // Check if the 'extrapolations' table exists
  const hasExtrapolationsTable = data.some(table => table.tablename === 'extrapolations');

  if (hasExtrapolationsTable) {
    console.log('The extrapolations table exists.');
  } else {
    console.log('The extrapolations table does not exist.');
  }
}

checkExtrapolationsTable();
