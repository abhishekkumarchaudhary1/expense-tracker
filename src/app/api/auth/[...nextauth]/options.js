import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          console.log('Authorizing user with credentials:', credentials.email);
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }

          if (!user.isVerified) {
            console.log('User not verified:', credentials.email);
            throw new Error('Please verify your email before logging in');
          }

          const isPasswordCorrect = await user.comparePassword(credentials.password);
          
          if (!isPasswordCorrect) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid credentials');
          }

          console.log('User authenticated successfully:', user.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          // Instead of returning null, throw the error so NextAuth can handle it
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && token.id) {
          session.user.id = token.id;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-for-development',
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions; 