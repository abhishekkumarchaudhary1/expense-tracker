import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Expense from '@/models/Expense';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Get single expense
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const expense = await Expense.findById(id)
      .populate('paidBy', 'name email');

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense, { status: 200 });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// Update expense
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { description, amount, image } = body;

    await connectDB();

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Safely get the user ID from the session
    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'User session is invalid' },
        { status: 401 }
      );
    }

    // Convert both IDs to strings for proper comparison
    const expenseCreatorId = expense.paidBy.toString();
    const currentUserId = session.user.id.toString();
    
    // Check if the user is the creator of the expense
    if (expenseCreatorId !== currentUserId) {
      return NextResponse.json(
        { error: 'Not authorized to update this expense' },
        { status: 403 }
      );
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    
    if (image) {
      expense.image = image;
    }

    await expense.save();

    return NextResponse.json(
      { message: 'Expense updated successfully', expense },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// Delete expense
export async function DELETE(request, { params }) {
  try {
    // Get session with proper error handling
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session in DELETE handler:', JSON.stringify({
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      }));
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json(
        { error: 'Session error' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Add debug logging
    console.log('Delete authorization check:');
    console.log('- Expense paidBy:', expense.paidBy, typeof expense.paidBy);
    console.log('- paidBy toString:', expense.paidBy.toString());
    console.log('- Session:', session);
    console.log('- Session user:', session.user);
    
    // Safely get the user ID from the session
    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'User session is invalid' },
        { status: 401 }
      );
    }
    
    // Convert both IDs to strings for proper comparison
    const expenseCreatorId = expense.paidBy.toString();
    const currentUserId = session.user.id.toString();
    
    // Check if the user is the creator of the expense
    if (expenseCreatorId !== currentUserId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this expense' },
        { status: 403 }
      );
    }

    await Expense.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
} 