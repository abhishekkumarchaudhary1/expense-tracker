import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Expense from '@/models/Expense';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Get all expenses
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

    const expenses = await Expense.find()
      .populate('paidBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// Create new expense
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { description, amount, paidBy, image } = body;

    console.log('Received expense data:', body);
    console.log('Session user:', session.user);

    await connectDB();

    // Use paidBy from request if provided, otherwise use session user id
    const userId = paidBy || session.user.id;
    
    // Create the expense with the current user as both payer and only participant
    const newExpense = new Expense({
      description,
      amount,
      paidBy: userId,
      image,
    });

    console.log('Creating expense with:', {
      description,
      amount,
      paidBy: userId,
      image: image ? 'Provided' : 'Not provided'
    });

    await newExpense.save();

    return NextResponse.json(
      { message: 'Expense created successfully', expense: newExpense },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all expenses for the logged-in user
    await Expense.deleteMany({ paidBy: userId });

    return NextResponse.json({ message: 'All expenses deleted successfully' });
  } catch (error) {
    console.error('Delete all expenses error:', error);
    return NextResponse.json(
      { error: 'Failed to delete expenses' },
      { status: 500 }
    );
  }
} 