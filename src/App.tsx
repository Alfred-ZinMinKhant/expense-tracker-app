import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, Budget } from "./types/Expense";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import SyncManager from "./components/SyncManager";
import { exportToCSV } from "./utils/csvExport";
import { DeviceSyncManager } from "./utils/deviceSync";
import { CloudSyncManager, SaveCloudExpense } from "./utils/cloudSync-neon";
import "./App.css";

function App() {
  const [budget, setBudget] = useState<Budget>(() => {
    // Load budget from localStorage on initial load
    const savedBudget = localStorage.getItem("budget");
    if (savedBudget) {
      try {
        return JSON.parse(savedBudget);
      } catch (error) {
        console.error("Error parsing saved budget:", error);
      }
    }
    return { total: 0 };
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize device and load data
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize device sync
      DeviceSyncManager.initializeDevice();

      // Load from cloud
      await loadCloudData();
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Save budget to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("budget", JSON.stringify(budget));
  }, [budget]);

  const loadCloudData = async () => {
    try {
      await CloudSyncManager.syncAllExpenses();
      const cloudExpenses = await CloudSyncManager.fetchExpenses();

      // Convert cloud expenses to local format and validate
      const localExpenses = cloudExpenses
        .map((expense) => ({
          id: expense.id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          receiptPhoto:
            typeof (expense as any).receipt_photo === "string"
              ? (expense as any).receipt_photo.split("|")
              : [],
          foodPhoto:
            typeof (expense as any).food_photo === "string"
              ? (expense as any).food_photo.split("|")
              : [],
        }))
        .filter(
          (expense) =>
            expense &&
            typeof expense.amount === "number" &&
            !isNaN(expense.amount)
        );

      setExpenses(localExpenses);

      // Only show budget modal if no budget has been set
      if (budget.total === 0) {
        const savedBudget = localStorage.getItem("budget");
        if (savedBudget) {
          setBudget(JSON.parse(savedBudget));
        } else {
          setShowBudgetModal(true);
        }
      }
    } catch (error) {
      console.error("Error loading cloud data:", error);
      // Fallback to localStorage
      const savedExpenses = localStorage.getItem("expenses");
      const savedBudget = localStorage.getItem("budget");

      if (savedExpenses) {
        try {
          const parsedExpenses = JSON.parse(savedExpenses);
          // Validate expenses to ensure they have valid amounts
          const validExpenses = parsedExpenses.filter(
            (expense: any) =>
              expense &&
              typeof expense.amount === "number" &&
              !isNaN(expense.amount)
          );
          setExpenses(validExpenses);
        } catch (error) {
          console.error("Error parsing saved expenses:", error);
        }
      }

      // Only show budget modal if no budget has been set
      if (budget.total === 0) {
        if (savedBudget) {
          setBudget(JSON.parse(savedBudget));
        } else {
          setShowBudgetModal(true);
        }
      }
    }
  };

  const handleAddExpense = async (
    expenseData: Omit<Expense, "id" | "date">
  ) => {
    // Validate expense data
    if (
      typeof expenseData.amount !== "number" ||
      isNaN(expenseData.amount) ||
      expenseData.amount <= 0
    ) {
      console.error("Invalid expense amount:", expenseData.amount);
      return;
    }

    const newExpense: SaveCloudExpense = {
      amount: expenseData.amount,
      category: expenseData.category,
      description: expenseData.description,
      date: new Date().toISOString(),
      receipt_photo: expenseData.receiptPhoto
        ? expenseData.receiptPhoto.join("|")
        : "",
      food_photo: expenseData.foodPhoto ? expenseData.foodPhoto.join("|") : "",
    };
    try {
      const savedExpense = await CloudSyncManager.saveExpense(newExpense);
      // Convert savedExpense to local Expense format
      const localExpense: Expense = {
        id: savedExpense.id,
        amount: savedExpense.amount,
        category: savedExpense.category,
        description: savedExpense.description,
        date: savedExpense.date,
        receiptPhoto: savedExpense.receipt_photo
          ? savedExpense.receipt_photo.split("|")
          : [],
        foodPhoto: savedExpense.food_photo
          ? savedExpense.food_photo.split("|")
          : [],
      };
      setExpenses((prev) => [...prev, localExpense]);
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      // Delete from cloud
      await CloudSyncManager.deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleUpdateExpense = async (updatedExpense: Omit<Expense, "id">) => {
    if (!editingExpense) return;

    // Validate updated expense data
    if (
      typeof updatedExpense.amount !== "number" ||
      isNaN(updatedExpense.amount) ||
      updatedExpense.amount <= 0
    ) {
      console.error("Invalid expense amount:", updatedExpense.amount);
      return;
    }

    const expenseToUpdate: Expense = {
      ...editingExpense,
      ...updatedExpense,
    };

    try {
      // Convert to cloud format for update
      const cloudExpense = {
        id: expenseToUpdate.id,
        amount: expenseToUpdate.amount,
        category: expenseToUpdate.category,
        description: expenseToUpdate.description,
        date: expenseToUpdate.date,
        receipt_photo: expenseToUpdate.receiptPhoto?.join("|") || "",
        food_photo: expenseToUpdate.foodPhoto?.join("|") || "",
      };

      // Update in cloud
      await CloudSyncManager.updateExpense(cloudExpense);

      // Update local state
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpense.id ? expenseToUpdate : expense
        )
      );

      setEditingExpense(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleSetBudget = (totalBudget: number) => {
    setBudget({ total: totalBudget });
    setShowBudgetModal(false);
  };

  const handleSyncComplete = () => {
    loadCloudData();
  };

  const totalSpent = expenses.reduce((sum, expense) => {
    const amount = Number(expense.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const remainingBudget = budget.total - totalSpent;

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <i className="fas fa-plane"></i> Trip Expense Tracker
        </h1>
        <div className="budget-info">
          <div className="budget-display">
            <span>Budget: ฿{Number(budget.total || 0).toFixed(2)}</span>
            <span>Spent: ฿{Number(totalSpent || 0).toFixed(2)}</span>
            <span>Remaining: ฿{Number(remainingBudget || 0).toFixed(2)}</span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setShowBudgetModal(true)}
          >
            Set Budget
          </button>
          <button
            className="btn btn-success"
            onClick={() => exportToCSV(expenses)}
          >
            Export CSV
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="content-grid">
          <div className="form-section">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <ExpenseForm
                onAddExpense={handleAddExpense}
                editingExpense={editingExpense}
                onUpdateExpense={handleUpdateExpense}
              />
            )}
          </div>

          <div className="list-section">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <ExpenseList
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={handleEditExpense}
              />
            )}
          </div>
        </div>
      </main>

      <SyncManager onSyncComplete={handleSyncComplete} />

      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Set Your Budget</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const budgetAmount = parseFloat((e.target as any).budget.value);
                handleSetBudget(budgetAmount);
              }}
            >
              <input
                type="number"
                name="budget"
                placeholder="Enter total budget"
                step="0.01"
                min="0"
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBudgetModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Expense</h3>
            <ExpenseForm
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
              onUpdateExpense={handleUpdateExpense}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingExpense(null);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
