# Neon Database Setup Guide for Expense Tracker

This guide explains how to set up and use the new Neon database integration with Thai Baht currency for your expense tracker.

## Overview

The expense tracker has been updated to use:

- **Neon PostgreSQL database** instead of localStorage/Netlify Blobs
- **Thai Baht (฿)** as the default currency instead of USD ($)
- **New Netlify functions** for database operations

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your Netlify site:

```
NETLIFY_DATABASE_URL=psql 'postgresql://neondb_owner:npg_L0URB4MSzWFk@ep-weathered-cake-ae5xmnsu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### 2. Database Schema

The system automatically creates an `expenses` table with the following schema:

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_photo TEXT,
  food_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Updated Components

#### Currency Changes

- **ExpenseForm**: Changed from "Amount ($)" to "Amount (฿)"
- **ExpenseList**: Changed from "$" to "฿" prefix for amounts
- **App**: Updated budget display to show "฿" instead of "$"
- **CSV Export**: Updated headers to show "Amount (฿)"

#### Database Integration

- **expenses-neon.js**: New Netlify function using Neon database
- **expenses.js**: Original function using Netlify Blobs (for reference)

### 4. API Endpoints

The new Neon-based API provides the same endpoints as before:

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses` - Update existing expense
- `DELETE /api/expenses` - Delete expense

### 5. Usage

To use the new Neon database:

1. Set up a Neon database account at https://neon.tech
2. Create a new database and get the connection string
3. Add the connection string as `NETLIFY_DATABASE_URL` environment variable
4. Deploy your updated code to Netlify
5. The database will be automatically initialized on first use

### 6. Migration from LocalStorage

If you're migrating from the localStorage version:

1. Export your existing expenses as CSV
2. Import the CSV data into the new database (manual process)
3. Update your Netlify functions to use the new endpoints

## Testing

You can test the new integration by:

1. Adding new expenses through the form
2. Checking that amounts are displayed in Thai Baht
3. Verifying data persists after page refresh
4. Testing CSV export with Thai Baht formatting

## Troubleshooting

- **Database connection issues**: Check your `NETLIFY_DATABASE_URL` environment variable
- **Currency display issues**: Ensure all components are updated to use "฿"
- **Missing data**: Verify the database table was created successfully

## Files Updated

- `netlify/functions/expenses-neon.js` - New Neon database functions
- `src/components/ExpenseForm.tsx` - Updated currency display
- `src/components/ExpenseList.tsx` - Updated currency display
- `src/App.tsx` - Updated budget display
- `src/utils/csvExport.ts` - Updated CSV export with Thai Baht
- `package.json` - Added @netlify/neon dependency
