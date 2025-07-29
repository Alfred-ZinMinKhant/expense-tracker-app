import { DeviceSyncManager } from "./deviceSync";

export interface CloudExpense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_photo?: string;
  food_photo?: string;
  user_id?: string;
  device_id?: string;
}

export class CloudSyncManager {
  private static readonly API_URL = "/.netlify/functions/expenses-neon";

  static async fetchExpenses(): Promise<CloudExpense[]> {
    try {
      const response = await fetch(this.API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  }

  static async saveExpense(
    expense: Omit<CloudExpense, "userId" | "deviceId">
  ): Promise<CloudExpense> {
    const cloudExpense = {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      receipt_photo: expense.receipt_photo,
      food_photo: expense.food_photo,
    };

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cloudExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving expense:", error);
      throw error;
    }
  }

  static async updateExpense(expense: CloudExpense): Promise<CloudExpense> {
    try {
      const response = await fetch(this.API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      const response = await fetch(this.API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  }

  static async syncAllExpenses(): Promise<void> {
    try {
      await this.fetchExpenses();
    } catch (error) {
      console.error("Error syncing expenses:", error);
    }
  }
}
