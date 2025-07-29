import { Expense } from "../types/Expense";

export const exportToCSV = (expenses: Expense[]) => {
  if (expenses.length === 0) {
    alert("No expenses to export!");
    return;
  }

  const headers = [
    "Date",
    "Amount (฿)",
    "Category",
    "Description",
    "Has Receipt",
    "Has Food Photo",
  ];

  const csvContent = [
    headers.join(","),
    ...expenses.map((expense) =>
      [
        new Date(expense.date).toLocaleDateString(),
        expense.amount.toFixed(2),
        expense.category,
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.receiptPhoto ? "Yes" : "No",
        expense.foodPhoto ? "Yes" : "No",
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `trip-expenses-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
