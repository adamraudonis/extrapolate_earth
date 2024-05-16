const { Pool } = require('pg');

// Database connection credentials
const dbConfig = {
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(dbConfig);

async function createTables() {

  const createAdminTableSql = `
    CREATE TABLE IF NOT EXISTS admins (
      id UUID REFERENCES auth.users(id) PRIMARY KEY
    );
  `;

  const createProfilesTableSql = `
    CREATE TABLE IF NOT EXISTS profiles (
      user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
      email TEXT,
      name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createExtrapolationPromptTableSql = `
    CREATE TABLE IF NOT EXISTS extrapolation_prompt (
      id SERIAL PRIMARY KEY,
      extrapolation_text TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      unit TEXT NOT NULL,
      is_active BOOLEAN NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      minimum NUMERIC,
      maximum NUMERIC,
      initial_year_value NUMERIC
    );
  `;

  const createUserExtrapolationTableSql = `
    CREATE TABLE IF NOT EXISTS user_extrapolation (
      id SERIAL PRIMARY KEY,
      extrapolation_prompt_id INT REFERENCES extrapolation_prompt(id),
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      rationale TEXT,
      is_active BOOLEAN NOT NULL
    );
  `;

  const createExtrapolationValuesTableSql = `
    CREATE TABLE IF NOT EXISTS extrapolation_values (
      id SERIAL PRIMARY KEY,
      user_extrapolation_id INT REFERENCES user_extrapolation(id),
      extrapolation_prompt_id INT REFERENCES extrapolation_prompt(id),
      year INT NOT NULL,
      value NUMERIC NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createGroundTruthTableSql = `
    CREATE TABLE IF NOT EXISTS ground_truth (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      source_link TEXT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id UUID REFERENCES auth.users(id)
    );
  `;

  const createGroundTruthValuesTableSql = `
    CREATE TABLE IF NOT EXISTS ground_truth_values (
      id SERIAL PRIMARY KEY,
      ground_truth_id INT REFERENCES ground_truth(id),
      year INT NOT NULL,
      value NUMERIC NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id UUID REFERENCES auth.users(id)
    );
  `;

  try {
    const client = await pool.connect();

    await client.query(createAdminTableSql);
    console.log('admin table created successfully.');

    await client.query(createProfilesTableSql);
    console.log('Profiles table created successfully.');

    await client.query(createExtrapolationPromptTableSql);
    console.log('Extrapolation Prompt table created successfully.');

    await client.query(createUserExtrapolationTableSql);
    console.log('User Extrapolation table created successfully.');

    await client.query(createExtrapolationValuesTableSql);
    console.log('Extrapolation Values table created successfully.');

    await client.query(createGroundTruthTableSql);
    console.log('Ground Truth table created successfully.');

    await client.query(createGroundTruthValuesTableSql);
    console.log('Ground Truth Values table created successfully.');

    client.release();
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();