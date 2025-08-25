// Database setup script
require("dotenv").config({ path: ".env.development.local" });
const { sql } = require("@vercel/postgres");

async function setupDatabase() {
  try {
    console.log("Creating user_items table...");

    await sql`
      CREATE TABLE IF NOT EXISTS user_items (
        user_id TEXT PRIMARY KEY,
        access_token_enc TEXT NOT NULL,
        institution_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log("✅ user_items table created successfully");

    // Check if table exists and show structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_items'
    `;

    console.log("Table structure:", tableInfo.rows);
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  }
}

setupDatabase();
