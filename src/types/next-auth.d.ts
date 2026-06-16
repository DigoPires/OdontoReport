import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    googleId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    googleId?: string;
  }
}
