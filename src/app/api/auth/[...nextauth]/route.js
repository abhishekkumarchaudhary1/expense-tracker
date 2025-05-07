import NextAuth from 'next-auth';
import { authOptions } from './options';

console.log('NextAuth route handler initialized');

// In Next.js 15, we should export the handler directly
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST } 