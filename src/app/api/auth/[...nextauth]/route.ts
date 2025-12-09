import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists
        const existingUser = await query(
          "SELECT * FROM users WHERE email = $1",
          [user.email]
        );

        if (existingUser.rows.length === 0) {
          // Create new user
          await query(
            `INSERT INTO users (email, name, image, provider, provider_account_id, access_token, refresh_token)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              user.email,
              user.name,
              user.image,
              account?.provider || "google",
              account?.providerAccountId,
              account?.access_token,
              account?.refresh_token,
            ]
          );
        } else {
          // Update tokens
          await query(
            `UPDATE users
             SET access_token = $1, refresh_token = $2, image = $3, name = $4
             WHERE email = $5`,
            [
              account?.access_token,
              account?.refresh_token,
              user.image,
              user.name,
              user.email,
            ]
          );
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        const userResult = await query(
          "SELECT id, email, name, image FROM users WHERE email = $1",
          [session.user.email]
        );
        if (userResult.rows.length > 0) {
          session.user.id = userResult.rows[0].id;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
