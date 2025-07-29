import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, Budget } from "./types/Expense";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import SyncManager from "./components/SyncManager";
import { exportToCSV } from "./utils/csvExport";
import { DeviceSyncManager } from "./utils/deviceSync";
import { CloudSyncManager } from "./utils/cloudSync-neon";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, remaining: 0 });
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

  const loadCloudData = async () => {
    try {
      await CloudSyncManager.syncAllExpenses();
      const cloudExpenses = await CloudSyncManager.fetchExpenses();

      // Convert cloud expenses to local format
      const localExpenses = cloudExpenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        receiptPhoto: (expense as any).receipt_photo || [],
        foodPhoto: (expense as any).food_photo || [],
      }));

      setExpenses(localExpenses);

      // Load budget from localStorage
      const savedBudget = localStorage.getItem("budget");
      if (savedBudget) {
        setBudget(JSON.parse(savedBudget));
      } else {
        setShowBudgetModal(true);
      }
    } catch (error) {
      console.error("Error loading cloud data:", error);
      // Fallback to localStorage
      const savedExpenses = localStorage.getItem("expenses");
      const savedBudget = localStorage.getItem("budget");

      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }

      if (savedBudget) {
        setBudget(JSON.parse(savedBudget));
      } else {
        setShowBudgetModal(true);
      }
    }
  };

  const handleAddExpense = (expenseData: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newExpense]);
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

  // Removed unused handleEditExpense function

  const handleSetBudget = (totalBudget: number) => {
    setBudget({ total: totalBudget, remaining: totalBudget });
    setShowBudgetModal(false);
  };

  const handleSyncComplete = () => {
    loadCloudData();
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
            <span>Remaining: ฿{Number(budget.remaining || 0).toFixed(2)}</span>
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
              <ExpenseForm onAddExpense={handleAddExpense} />
            )}
          </div>

          <div className="list-section">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <ExpenseList
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={(expense) => {
                  // Removed usage of setEditingExpense and setShowEditModal since state variables removed
                }}
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
    </div>
  );
}

export default App;
