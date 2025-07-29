import React, { useState } from "react";
import { Expense } from "../types/Expense";
import "./ExpenseForm.css";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id" | "date">) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [foodPhoto, setFoodPhoto] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    onAddExpense({
      amount: parseFloat(amount),
      category,
      description,
      receiptPhoto: receiptPhoto || undefined,
      foodPhoto: foodPhoto || undefined,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setReceiptPhoto(null);
    setFoodPhoto(null);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Add New Expense</h3>

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
          onChange={(e) => handleImageUpload(e, setReceiptPhoto)}
        />
        {receiptPhoto && (
          <img
            src={receiptPhoto}
            alt="Receipt preview"
            className="preview-image"
          />
        )}
      </div>

      <div className="form-group">
        <label>Food Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, setFoodPhoto)}
        />
        {foodPhoto && (
          <img src={foodPhoto} alt="Food preview" className="preview-image" />
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
