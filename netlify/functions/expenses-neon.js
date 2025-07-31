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

// Create expenses table if it doesn't exist
async function initializeDatabase() {
  try {
    const sql = getDatabaseConnection();

    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        receipt_photo TEXT,
        food_photo TEXT,
        user_id VARCHAR(255),
        device_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Initialize database connection for each request
    const sql = getDatabaseConnection();

    // Initialize database on first request
    await initializeDatabase();

    switch (event.httpMethod) {
      case "GET": {
        const userId = event.queryStringParameters?.userId;
        let query = sql`
          SELECT id, amount, category, description, date, receipt_photo, food_photo, user_id, device_id
          FROM expenses
        `;

        if (userId) {
          query = sql`
            SELECT id, amount, category, description, date, receipt_photo, food_photo, user_id, device_id
            FROM expenses
            WHERE user_id = ${userId}
            ORDER BY date DESC
          `;
        } else {
          query = sql`
            SELECT id, amount, category, description, date, receipt_photo, food_photo, user_id, device_id
            FROM expenses
            ORDER BY date DESC
          `;
        }

        const expenses = await query;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(expenses),
        };
      }

      case "POST": {
        const newExpense = JSON.parse(event.body);
        const [createdExpense] = await sql`
          INSERT INTO expenses (amount, category, description, date, receipt_photo, food_photo, user_id, device_id)
          VALUES (${newExpense.amount}, ${newExpense.category}, ${
          newExpense.description
        }, ${newExpense.date}, ${newExpense.receipt_photo || null}, ${
          newExpense.food_photo || null
        }, ${newExpense.userId || null}, ${newExpense.deviceId || null})
          RETURNING id, amount, category, description, date, receipt_photo, food_photo, user_id, device_id
        `;
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(createdExpense),
        };
      }

      case "PUT": {
        const updatedExpense = JSON.parse(event.body);
        const [result] = await sql`
          UPDATE expenses
          SET amount = ${updatedExpense.amount},
              category = ${updatedExpense.category},
              description = ${updatedExpense.description},
              date = ${updatedExpense.date},
              receipt_photo = ${updatedExpense.receipt_photo || null},
              food_photo = ${updatedExpense.food_photo || null},
              user_id = ${updatedExpense.userId || null},
              device_id = ${updatedExpense.deviceId || null},
              updated_at = NOW()
          WHERE id = ${updatedExpense.id}
          RETURNING id, amount, category, description, date, receipt_photo, food_photo, user_id, device_id
        `;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      case "DELETE": {
        const { id } = JSON.parse(event.body);
        await sql`
          DELETE FROM expenses
          WHERE id = ${id}
        `;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
