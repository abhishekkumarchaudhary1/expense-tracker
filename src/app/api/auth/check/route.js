import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/options';

export async function GET(request) {
  try {
    // Check if auth options are properly configured
    console.log('Auth check route called');
    console.log('Auth options:', {
      providers: authOptions.providers.map(p => p.id),
      callbacksConfigured: Object.keys(authOptions.callbacks || {}),
      secret: authOptions.secret ? 'Set' : 'Not set',
      debug: authOptions.debug
    });
    
    try {
      // Try to get the session
      const session = await getServerSession(authOptions);
      
      return NextResponse.json({
        status: 'success',
        authConfigured: true,
        sessionActive: !!session,
        user: session ? {
          isAuthenticated: !!session.user,
          hasId: !!session.user?.id,
          email: session.user?.email
        } : null,
        timestamp: new Date().toISOString()
      });
    } catch (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({
        status: 'error',
        message: 'Session error: ' + sessionError.message,
        error: 'session_error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 