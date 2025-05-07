import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setUser(session?.user || null);
      setLoading(false);
    }
  }, [session, status]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: `${window.location.origin}/dashboard`
      });
      
      console.log('SignIn result:', result);

      if (!result) {
        return { 
          success: false, 
          error: 'Authentication failed. Please try again.' 
        };
      }

      if (result.error) {
        // Handle specific error cases
        if (result.error === 'CredentialsSignin') {
          return { 
            success: false, 
            error: 'Invalid email or password. Please try again.' 
          };
        }
        return { 
          success: false, 
          error: result.error 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to register' 
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to verify email' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to process request' 
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to reset password' 
      };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 