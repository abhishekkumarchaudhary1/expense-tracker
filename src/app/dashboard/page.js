'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash, FiDownload } from 'react-icons/fi';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { 
    expenses, 
    adjustments,
    loading: expenseLoading, 
    error: expenseError,
    fetchExpenses,
    fetchAdjustments,
    deleteExpense,
    deleteAllExpenses,
    adjustExpenses
  } = useExpenses();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [adjustConfirm, setAdjustConfirm] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState('');
  const [adjustPasskey, setAdjustPasskey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDelete = async (id) => {
    const result = await deleteExpense(id);
    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  const handleAdjust = async () => {
    if (!adjustPasskey) {
      setError('Please enter the passkey');
      return;
    }

    const result = await adjustExpenses(adjustPasskey);
    if (result.success) {
      setAdjustSuccess(result.message);
      setAdjustConfirm(false);
      setAdjustPasskey('');
      setError('');
      setTimeout(() => {
        setAdjustSuccess('');
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteAll = async () => {
    const result = await deleteAllExpenses();
    if (result.success) {
      setDeleteAllConfirm(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.name}</span>
              <Link 
                href="/auth/logout" 
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Expenses</h2>
          <div className="mt-4 md:mt-0 space-x-3 flex">
            <Link
              href="/expenses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Add Expense
            </Link>
            <button
              onClick={() => setAdjustConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiDownload className="mr-2 -ml-1 h-5 w-5" />
              Adjust
            </button>
          </div>
        </div>

        {adjustSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {adjustSuccess}
          </div>
        )}

        {(error || expenseError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || expenseError}
          </div>
        )}

        {adjustments && adjustments.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Current Balances</h3>
              <p className="mt-1 text-sm text-gray-500">
                Balances are relative to the highest contributor.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Paid
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adjustments.map((adjustment) => (
                      <tr key={adjustment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {adjustment.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{adjustment.paid.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={
                            adjustment.simplifiedBalance === 0 
                              ? '' 
                              : adjustment.simplifiedBalance > 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                          }>
                            {adjustment.simplifiedBalance > 0 ? '+' : ''}
                            ₹{adjustment.simplifiedBalance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All Expenses
              </button>
            </div>
          </div>
        )}

        {expenseLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <div key={expense._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      ₹{expense.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Paid by: <span className="font-medium">{expense.paidBy.name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: <span className="font-medium">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`font-medium ${expense.isSettled ? 'text-green-600' : 'text-yellow-600'}`}>
                        {expense.isSettled ? 'Settled' : 'Pending'}
                      </span>
                    </p>
                  </div>
                  
                  {expense.image && (
                    <div className="mt-3">
                      <div className="relative h-40 w-full overflow-hidden rounded">
                        <Image 
                          src={expense.image}
                          alt={expense.description}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    {expense.paidBy._id === user?.id && !expense.isSettled && (
                      <>
                        <Link
                          href={`/expenses/edit/${expense._id}`}
                          className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(expense._id)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="mb-4 text-gray-500">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust confirmation modal */}
      {adjustConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Adjustment</h3>
            <p className="mb-4 text-gray-500">
              This will settle all expenses and calculate balances relative to the highest contributor. 
              People who paid less will show negative balances indicating how much they need to pay.
            </p>
            <div className="mb-4">
              <label htmlFor="passkey" className="block text-sm font-medium text-gray-700">
                Enter Passkey
              </label>
              <input
                type="password"
                id="passkey"
                value={adjustPasskey}
                onChange={(e) => {
                  setAdjustPasskey(e.target.value);
                  setError(''); // Clear error when user types
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter passkey to confirm"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setAdjustConfirm(false);
                  setAdjustPasskey('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete all confirmation modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete All</h3>
            <p className="mb-4 text-gray-500">
              Are you sure you want to delete all your expenses? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteAllConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}