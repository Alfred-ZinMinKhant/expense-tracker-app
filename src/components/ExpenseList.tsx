import React from "react";
import { Expense } from "../types/Expense";
import "./ExpenseList.css";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
}) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: "#ff6b6b",
      transport: "#4ecdc4",
      accommodation: "#45b7d1",
      entertainment: "#96ceb4",
      shopping: "#feca57",
      business: "#ff9ff3",
      other: "#a29bfe",
    };
    return colors[category] || "#6c5ce7";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `฿${Number(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="expense-list">
      <h3>Expenses</h3>
      {expenses.length === 0 ? (
        <p className="no-expenses">No expenses added yet</p>
      ) : (
        <div className="expenses-container">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <span
                  className="category-badge"
                  style={{
                    backgroundColor: getCategoryColor(expense.category),
                  }}
                >
                  {expense.category}
                </span>
                <span className="expense-amount">
                  {formatAmount(expense.amount)}
                </span>
              </div>

              <div className="expense-details">
                <h4>{expense.description}</h4>
                <p className="expense-date">{formatDate(expense.date)}</p>

                {(expense.receiptPhoto?.length ||
                  expense.foodPhoto?.length) && (
                  <div className="expense-photos">
                    {expense.receiptPhoto?.map((photo, index) => (
                      <img
                        key={`receipt-${index}`}
                        src={photo}
                        alt={`Receipt ${index + 1}`}
                        className="expense-photo"
                      />
                    ))}
                    {expense.foodPhoto?.map((photo, index) => (
                      <img
                        key={`food-${index}`}
                        src={photo}
                        alt={`Food ${index + 1}`}
                        className="expense-photo"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn btn-danger"
                onClick={() => onDeleteExpense(expense.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
