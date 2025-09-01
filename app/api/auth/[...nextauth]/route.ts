import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: '1002003' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const res = await fetch('http://localhost:8000/v1/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ username: credentials.username, password: credentials.password }),
          });

          const data = await res.json();

          if (!res.ok) {
            // authentication failed
            return null;
          }

          const token = data?.token || data?.data?.token || null;
          const user = data?.user || data?.data?.user || { username: credentials.username };

          // Attach token to returned user object so it becomes available in callbacks
          return { ...user, token };
        } catch (err) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user = user;
        if (user.token) token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'default-secret-change-me',
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
