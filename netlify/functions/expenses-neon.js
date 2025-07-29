const { neon } = require("@netlify/neon");

// Initialize database connection
const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Create expenses table if it doesn't exist
async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        receipt_photo TEXT,
        food_photo TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize database on startup
initializeDatabase();

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
    switch (event.httpMethod) {
      case "GET": {
        const expenses = await sql`
          SELECT id, amount, category, description, date, receipt_photo, food_photo
          FROM expenses
          ORDER BY date DESC
        `;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(expenses),
        };
      }

      case "POST": {
        const newExpense = JSON.parse(event.body);
        const [createdExpense] = await sql`
          INSERT INTO expenses (amount, category, description, receipt_photo, food_photo)
          VALUES (${newExpense.amount}, ${newExpense.category}, ${
          newExpense.description
        }, ${newExpense.receiptPhoto || null}, ${newExpense.foodPhoto || null})
          RETURNING id, amount, category, description, date, receipt_photo, food_photo
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
              receipt_photo = ${updatedExpense.receiptPhoto || null},
              food_photo = ${updatedExpense.foodPhoto || null},
              updated_at = NOW()
          WHERE id = ${updatedExpense.id}
          RETURNING id, amount, category, description, date, receipt_photo, food_photo
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
