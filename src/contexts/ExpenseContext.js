import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext({});

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch all expenses
  const fetchExpenses = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch expenses');
      }
      
      setExpenses(data);
      // Also fetch adjustments when expenses are updated
      await fetchAdjustments();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch adjustments
  const fetchAdjustments = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses/adjust');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch adjustments');
      }
      
      setAdjustments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new expense
  const createExpense = async (expenseData) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create an expense');
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add user information to the expense data
      const expenseWithUser = {
        ...expenseData,
        paidBy: user.id
      };
      
      console.log('Sending expense data to API:', expenseWithUser);
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseWithUser),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || 'Failed to create expense');
      }
      
      // Update expenses list and adjustments
      await fetchExpenses();
      
      return { success: true, expense: data.expense };
    } catch (error) {
      console.error('Create expense error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update expense
  const updateExpense = async (id, expenseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update expense');
      }
      
      // Update expenses list and adjustments
      await fetchExpenses();
      
      return { success: true, expense: data.expense };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete expense');
      }
      
      // Update expenses list and adjustments
      await fetchExpenses();
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete all expenses
  const deleteAllExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all expenses');
      }
      
      // Update expenses list and adjustments
      await fetchExpenses();
      
      return { success: true, message: data.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Adjust expenses
  const adjustExpenses = async (passkey) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Return the error message from the API
        return { 
          success: false, 
          error: data.error || 'Failed to adjust expenses' 
        };
      }
      
      // Update expenses list and adjustments
      await fetchExpenses();
      
      return { success: true, message: 'Expenses adjusted successfully' };
    } catch (error) {
      console.error('Adjust expenses error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Upload image
  const uploadImage = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
      return { success: true, imageUrl: data.imageUrl };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Load expenses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
    }
  }, [isAuthenticated]);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      adjustments,
      loading,
      error,
      fetchExpenses,
      fetchAdjustments,
      createExpense,
      updateExpense,
      deleteExpense,
      deleteAllExpenses,
      adjustExpenses,
      uploadImage,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext); 