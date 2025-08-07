import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Mainpage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const access = localStorage.getItem("access");

  useEffect(() => {
    if (!access) {
      navigate("/login");
    } else {
      fetchExpenses();
    }
  }, [access]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/expenses/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleAddExpense = async () => {
    if (!expenseName || !amount || !category || !date) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/expenses/`,
        {
          expense_name: expenseName,
          amount,
          category,
          date,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      setExpenseName("");
      setAmount("");
      setCategory("");
      setDate("");

      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Expense Tracker</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Expense Name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="date"
          className="form-control mb-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddExpense}>
          Add Expense
        </button>
      </div>

      <ul className="list-group">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {expense.expense_name} - ₹{expense.amount} ({expense.category}) on {expense.date}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteExpense(expense.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Mainpage;
