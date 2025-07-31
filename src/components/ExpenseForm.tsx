import React, { useState, useEffect } from "react";
import { Expense } from "../types/Expense";
import "./ExpenseForm.css";

// Define separate types for add and update functions
type AddExpenseData = Omit<Expense, "id" | "date">;
type UpdateExpenseData = Omit<Expense, "id">;

interface ExpenseFormProps {
  onAddExpense?: (expense: AddExpenseData) => void;
  editingExpense?: Expense | null;
  onUpdateExpense?: (expense: UpdateExpenseData) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  editingExpense,
  onUpdateExpense,
}) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [receiptPhoto, setReceiptPhoto] = useState<string[]>([]);
  const [foodPhoto, setFoodPhoto] = useState<string[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      // Convert date to datetime-local input format (YYYY-MM-DDTHH:mm)
      // Handle different date formats
      let formattedDate = "";
      if (editingExpense.date) {
        try {
          // Try to parse the date and convert to the correct format
          const dateObj = new Date(editingExpense.date);
          formattedDate = dateObj.toISOString().slice(0, 16);
        } catch (error) {
          // If parsing fails, try to use the date as is (assuming it's already in the correct format)
          formattedDate = editingExpense.date.slice(0, 16);
        }
      }
      setDate(formattedDate);
      setReceiptPhoto(editingExpense.receiptPhoto || []);
      setFoodPhoto(editingExpense.foodPhoto || []);
    }
  }, [editingExpense]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readers: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        readers.push(
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(files[i]);
          })
        );
      }
      Promise.all(readers).then((images) => {
        setImages((prevImages: string[]) => [...prevImages, ...images]);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const expenseData = {
      amount: amountValue,
      category,
      description,
      receiptPhoto: receiptPhoto.length > 0 ? receiptPhoto : undefined,
      foodPhoto: foodPhoto.length > 0 ? foodPhoto : undefined,
    };

    if (editingExpense && onUpdateExpense) {
      // For updates, we need to include the date from the form
      const updatedExpenseData = {
        ...expenseData,
        date: date, // Include the date from the form
      };
      onUpdateExpense(updatedExpenseData);
    } else if (onAddExpense) {
      onAddExpense(expenseData);
    }

    // Reset form only if not editing
    if (!editingExpense) {
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 16));
      setReceiptPhoto([]);
      setFoodPhoto([]);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>{editingExpense ? "Edit Expense" : "Add New Expense"}</h3>

      <div className="form-group">
        <label>Amount (฿)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="food">Food & Drinks</option>
          <option value="transport">Transportation</option>
          <option value="accommodation">Accommodation</option>
          <option value="entertainment">Entertainment</option>
          <option value="shopping">Shopping</option>
          <option value="business">Business</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Dinner at restaurant"
          required
        />
      </div>

      <div className="form-group">
        <label>Receipt Photo</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, setReceiptPhoto)}
        />
        {receiptPhoto.length > 0 &&
          receiptPhoto.map((photo, index) => (
            <div
              key={`receipt-preview-${index}`}
              className="photo-preview-container"
            >
              <img
                src={photo}
                alt={`Receipt preview ${index + 1}`}
                className="preview-image"
              />
              <button
                type="button"
                className="btn btn-danger btn-sm remove-photo-button"
                onClick={() => {
                  setReceiptPhoto((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                Remove
              </button>
            </div>
          ))}
      </div>

      <div className="form-group">
        <label>Food Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, setFoodPhoto)}
        />
        {foodPhoto.length > 0 &&
          foodPhoto.map((photo, index) => (
            <div
              key={`food-preview-${index}`}
              className="photo-preview-container"
            >
              <img
                src={photo}
                alt={`Food preview ${index + 1}`}
                className="preview-image"
              />
              <button
                type="button"
                className="btn btn-danger btn-sm remove-photo-button"
                onClick={() => {
                  setFoodPhoto((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                Remove
              </button>
            </div>
          ))}
      </div>

      <div className="form-group">
        <label>Date and Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {editingExpense ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
};

export default ExpenseForm;
