import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, Budget } from "./types/Expense";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import { exportToCSV } from "./utils/csvExport";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, remaining: 0 });
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Load expenses from localStorage on app start
  useEffect(() => {
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
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateRemainingBudget();
  }, [expenses]);

  // Save budget to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("budget", JSON.stringify(budget));
  }, [budget]);

  const updateRemainingBudget = () => {
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    setBudget((prev) => ({ ...prev, remaining: prev.total - totalSpent }));
  };

  const handleAddExpense = (expenseData: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const handleSetBudget = (totalBudget: number) => {
    setBudget({ total: totalBudget, remaining: totalBudget });
    setShowBudgetModal(false);
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
            <span>Budget: ฿{budget.total.toFixed(2)}</span>
            <span>Spent: ฿{totalSpent.toFixed(2)}</span>
            <span>Remaining: ฿{budget.remaining.toFixed(2)}</span>
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
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          <div className="list-section">
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        </div>
      </main>

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
