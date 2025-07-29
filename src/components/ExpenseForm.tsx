import React, { useState } from "react";
import { Expense } from "../types/Expense";
import "./ExpenseForm.css";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [receiptPhoto, setReceiptPhoto] = useState<string[]>([]);
  const [foodPhoto, setFoodPhoto] = useState<string[]>([]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImages: (images: string[]) => void
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
        setImages(images);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) return;

    onAddExpense({
      amount: parseFloat(amount),
      category,
      description,
      date,
      receiptPhoto: receiptPhoto.length > 0 ? receiptPhoto : undefined,
      foodPhoto: foodPhoto.length > 0 ? foodPhoto : undefined,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setReceiptPhoto([]);
    setFoodPhoto([]);
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
          multiple
          onChange={(e) => handleImageUpload(e, setReceiptPhoto)}
        />
        {receiptPhoto.length > 0 &&
          receiptPhoto.map((photo, index) => (
            <img
              key={`receipt-preview-${index}`}
              src={photo}
              alt={`Receipt preview ${index + 1}`}
              className="preview-image"
            />
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
            <img
              key={`food-preview-${index}`}
              src={photo}
              alt={`Food preview ${index + 1}`}
              className="preview-image"
            />
          ))}
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
