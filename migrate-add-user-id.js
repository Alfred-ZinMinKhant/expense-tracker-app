const { neon } = require("@netlify/neon");

// Initialize database connection
const getDatabaseConnection = () => {
  const databaseUrl =
    process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return neon(databaseUrl);
};

async function migrateDatabase() {
  console.log("Starting database migration...");

  try {
    const sql = getDatabaseConnection();

    // Check if user_id column exists
    const tableInfo = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'user_id'
    `;

    if (tableInfo.length === 0) {
      console.log("Adding user_id column to expenses table...");

      // Add user_id column
      await sql`
        ALTER TABLE expenses 
        ADD COLUMN user_id VARCHAR(255)
      `;

      // Add device_id column as well (might also be missing)
      const deviceIdInfo = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'device_id'
      `;

      if (deviceIdInfo.length === 0) {
        await sql`
          ALTER TABLE expenses 
          ADD COLUMN device_id VARCHAR(255)
        `;
        console.log("Added device_id column to expenses table");
      }

      console.log("Migration completed successfully!");
    } else {
      console.log("user_id column already exists, skipping migration");
    }

    // Verify the table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expenses'
      ORDER BY ordinal_position
    `;

    console.log("Current table structure:");
    columns.forEach((col) => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
