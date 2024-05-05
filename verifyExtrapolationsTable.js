const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyExtrapolationsTable() {
  // Attempt to select from the 'extrapolations' table
  const { data, error } = await supabase
    .from('extrapolations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from extrapolations table:', error);
    return;
  }

  if (data.length > 0) {
    console.log('The extrapolations table exists and has data:', data);
  } else {
    console.log('The extrapolations table exists but is empty.');
  }
}

verifyExtrapolationsTable();
