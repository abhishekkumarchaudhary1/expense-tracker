import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all users
    const users = await User.find({ isVerified: true });

    // Get all expenses that are not settled
    const expenses = await Expense.find({ isSettled: false })
      .populate('paidBy', 'name email');

    // Calculate the total contribution of each user
    const userContributions = {};
    
    // Initialize user contributions to 0
    users.forEach(user => {
      userContributions[user._id.toString()] = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        paid: 0,
        balance: 0
      };
    });

    // Calculate how much each person paid
    expenses.forEach(expense => {
      const paidById = expense.paidBy._id.toString();
      
      // Add to the amount this person paid
      userContributions[paidById].paid += expense.amount;
    });

    // Calculate average per person
    let totalPaid = 0;
    let totalUsers = 0;
    
    for (const userId in userContributions) {
      totalPaid += userContributions[userId].paid;
      totalUsers++;
    }
    
    const averagePerPerson = totalUsers > 0 ? totalPaid / totalUsers : 0;
    
    // Calculate balance for each user (paid minus average)
    for (const userId in userContributions) {
      userContributions[userId].balance = userContributions[userId].paid - averagePerPerson;
    }
    
    // Convert to array and sort by paid amount (highest to lowest)
    const balances = Object.values(userContributions).sort((a, b) => b.paid - a.paid);
    
    // Find the highest payer's amount
    const highestPaid = balances.length > 0 ? balances[0].paid : 0;
    
    // Calculate simplified balance relative to highest payer
    balances.forEach(user => {
      user.simplifiedBalance = user.paid - highestPaid;
    });

    return NextResponse.json(balances, { status: 200 });
  } catch (error) {
    console.error('Error calculating adjustments:', error);
    return NextResponse.json(
      { error: 'Failed to calculate adjustments' },
      { status: 500 }
    );
  }
}

// Mark all expenses as settled
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passkey } = await request.json();
    
    // Verify passkey
    if (passkey !== process.env.ADJUST_PASSKEY) {
      return NextResponse.json(
        { error: 'Invalid passkey' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all expenses
    const expenses = await Expense.find().populate('paidBy', 'name email');
    
    // Calculate total amount and per person share
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const uniqueUsers = [...new Set(expenses.map(expense => expense.paidBy._id.toString()))];
    const perPersonShare = totalAmount / uniqueUsers.length;

    // Calculate how much each person paid
    const userPayments = {};
    expenses.forEach(expense => {
      const userId = expense.paidBy._id.toString();
      userPayments[userId] = (userPayments[userId] || 0) + expense.amount;
    });

    // Calculate final balances
    const balances = Object.entries(userPayments).map(([userId, paid]) => {
      const user = expenses.find(e => e.paidBy._id.toString() === userId).paidBy;
      return {
        id: userId,
        name: user.name,
        paid: paid,
        share: perPersonShare,
        balance: paid - perPersonShare
      };
    });

    // Find the highest contributor
    const highestContributor = balances.reduce((max, current) => 
      current.paid > max.paid ? current : max
    , balances[0]);

    // Calculate simplified balances relative to highest contributor
    const simplifiedBalances = balances.map(balance => ({
      id: balance.id,
      name: balance.name,
      paid: balance.paid,
      simplifiedBalance: balance.balance - highestContributor.balance,
      expenses: expenses
        .filter(exp => exp.paidBy._id.toString() === balance.id.toString())
        .map(exp => ({
          description: exp.description,
          amount: exp.amount
        }))
    }));

    // Mark all expenses as settled
    await Expense.updateMany(
      { isSettled: false },
      { $set: { isSettled: true } }
    );

    return NextResponse.json(simplifiedBalances);
  } catch (error) {
    console.error('Adjust expenses error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust expenses' },
      { status: 500 }
    );
  }
} 