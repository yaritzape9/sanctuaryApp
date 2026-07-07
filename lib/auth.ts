import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.SANCTUARY_API_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          if (!data?.token || !data?.userId) {
            return null;
          }

          return {
            id: data.userId,
            email: credentials.email as string,
            backendToken: data.token,
          };
        } catch (err) {
          console.error("Credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Google sign-in: sync with backend to get a real user + JWT
      if (account?.provider === "google" && profile) {
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              googleId: profile.sub,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.token && data?.userId) {
              token.sub = data.userId;
              token.backendToken = data.token;
            }
          } else {
            console.error("oauth-sync failed:", res.status);
          }
        } catch (err) {
          console.error("oauth-sync error:", err);
        }
      }

      if (user) {
        token.sub = user.id;
        if ("backendToken" in user && user.backendToken) {
          token.backendToken = user.backendToken as string;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.backendToken) {
        session.backendToken = token.backendToken as string;
      }
      return session;
    },
  },
});