const { NetlifyBlobs } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  const blobs = new NetlifyBlobs({
    siteId: process.env.SITE_ID,
    token: process.env.NETLIFY_ACCESS_TOKEN,
  });

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    switch (event.httpMethod) {
      case "GET": {
        const userId = event.queryStringParameters?.userId;
        let allExpenses = (await blobs.get("expenses")) || [];

        // Filter by userId if provided
        if (userId) {
          allExpenses = allExpenses.filter(
            (expense) => expense.userId === userId
          );
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(allExpenses),
        };
      }
      case "POST": {
        const newExpense = JSON.parse(event.body);
        let expenses = (await blobs.get("expenses")) || [];
        expenses.push(newExpense);
        await blobs.set("expenses", expenses);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newExpense),
        };
      }
      case "PUT": {
        const updatedExpense = JSON.parse(event.body);
        let expenses = (await blobs.get("expenses")) || [];
        const index = expenses.findIndex((e) => e.id === updatedExpense.id);
        if (index !== -1) {
          expenses[index] = updatedExpense;
          await blobs.set("expenses", expenses);
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedExpense),
        };
      }
      case "DELETE": {
        const { id } = JSON.parse(event.body);
        let expenses = (await blobs.get("expenses")) || [];
        expenses = expenses.filter((e) => e.id !== id);
        await blobs.set("expenses", expenses);
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
