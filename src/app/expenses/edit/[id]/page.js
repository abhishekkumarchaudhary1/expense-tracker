'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';

export default function EditExpensePage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { updateExpense, uploadImage, loading } = useExpenses();
  const [error, setError] = useState('');
  const [expense, setExpense] = useState(null);
  const [fetchingExpense, setFetchingExpense] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch expense details
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setFetchingExpense(true);
        const res = await fetch(`/api/expenses/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setExpense(data);
          setImagePreview(data.image || '');
          
          // Pre-fill form (without participants)
          reset({
            description: data.description,
            amount: data.amount
          });
          
          // Check if current user is the creator
          if (user && data.paidBy._id !== user.id) {
            router.push('/dashboard');
          }
        } else {
          setError(data.error || 'Failed to fetch expense');
        }
      } catch (error) {
        setError('Failed to fetch expense. Please try again.');
      } finally {
        setFetchingExpense(false);
      }
    };

    if (isAuthenticated && id) {
      fetchExpense();
    }
  }, [isAuthenticated, id, user, router, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      let imageUrl = expense.image;
      
      // Upload new image if selected
      if (uploadedImage) {
        const result = await uploadImage(uploadedImage);
        if (result.success) {
          imageUrl = result.imageUrl;
        } else {
          setError(result.error || 'Failed to upload image');
          return;
        }
      }
      
      // Update expense (without participants)
      const expenseData = {
        description: data.description,
        amount: parseFloat(data.amount),
        image: imageUrl,
      };
      
      const result = await updateExpense(id, expenseData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to update expense');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (authLoading || fetchingExpense) {
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
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Expense</h3>
              <p className="mt-1 text-sm text-gray-600">
                Update the details of your expense.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      {...register('description', { required: 'Description is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      step="0.01"
                      min="0"
                      {...register('amount', { 
                        required: 'Amount is required',
                        min: { value: 0, message: 'Amount must be positive' }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Receipt Image (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative h-48 w-full mb-4">
                            <Image 
                              src={imagePreview}
                              alt="Receipt preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>{imagePreview ? 'Change image' : 'Upload a file'}</span>
                            <input 
                              id="image" 
                              name="image" 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only" 
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}