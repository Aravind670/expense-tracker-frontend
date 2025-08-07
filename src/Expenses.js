import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export default function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    category: "",
    payment_method: "",
    notes: "",
  });
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); // 🆕 To display backend errors

  const access = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;

      const response = await axios.get(`${API_BASE_URL}/api/expenses/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
        params: params,
      });
      setExpenses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous error

    try {
      if (editId) {
        await axios.put(
          `${API_BASE_URL}/api/expenses/${editId}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/expenses/`, formData, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
      }

      setFormData({
        name: "",
        amount: "",
        date: "",
        category: "",
        payment_method: "",
        notes: "",
      });
      setEditId(null);
      setErrorMsg("");
      fetchExpenses();
    } catch (error) {
      console.error(error);
      const backendMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "An error occurred. Please check your input.";
      setErrorMsg(backendMsg);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      payment_method: expense.payment_method,
      notes: expense.notes,
    });
    setEditId(expense.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const total = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Expenses Tracker</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-6 rounded shadow-md max-w-xl mx-auto mb-8"
      >
        <h2 className="text-2xl mb-4 font-bold text-center">
          {editId ? "Edit Expense" : "Add Expense"}
        </h2>
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-center font-medium">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="payment_method"
            placeholder="Payment Method"
            value={formData.payment_method}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
          >
            {editId ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </form>

      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-2 mb-4">
          <input
            type="number"
            placeholder="Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border px-2 py-1 rounded text-black"
          />
          <input
            type="number"
            placeholder="Month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border px-2 py-1 rounded text-black"
          />
          <button
            onClick={fetchExpenses}
            className="bg-white text-black px-4 py-1 rounded"
          >
            Filter
          </button>
        </div>

        <h2 className="text-2xl mb-4 font-bold">Your Expenses</h2>
        <table className="w-full text-left table-auto bg-white text-black rounded shadow">
          <thead>
            <tr className="bg-emerald-200">
              <th className="p-2">Name</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
              <th className="p-2">Category</th>
              <th className="p-2">Payment</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-b">
                <td className="p-2">{exp.name}</td>
                <td className="p-2">${parseFloat(exp.amount).toFixed(2)}</td>
                <td className="p-2">{exp.date}</td>
                <td className="p-2">{exp.category}</td>
                <td className="p-2">{exp.payment_method}</td>
                <td className="p-2">{exp.notes}</td>
                <td className="p-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-xl font-bold">
          Total: ${total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
