import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export enum UserRole {
  user = "user",
  admin = "admin",
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth/adapters" {
  interface AdapterUser {
    login?: string;
    role?: UserRole;
    dashboardEnabled?: boolean;
    isTeamAdmin?: boolean;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string;
      role?: UserRole;
      dashboardEnabled?: boolean;
      isAdmin?: boolean;
      expires?: string;
      isTeamAdmin?: boolean;
    };
    accessToken?: string;
  }

  export interface Profile {
    login: string;
  }

  interface User {
    role?: UserRole;
    login?: string;
    expires?: string;
    isTeamAdmin?: boolean;
    isAdmin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_SERVER_PORT) || 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, // Use SSL for Gmail
      },
      from: process.env.EMAIL_FROM,
    }),
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
                prompt: "consent",
                access_type: "offline",
              },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        const userEmail = user?.email;
        if (!userEmail) return false;

        /*
        // Enable this to restrict sign-ins to certain domains or allowlist
        const domainCheck = ALLOWED_DOMAINS.some((d) => email.endsWith(d));
        if (!domainCheck) {
          const inAllowlist = await prisma.allowlist.findUnique({
            where: { email },
          });

          if (!inAllowlist) {
            return false;
          }
        }
        */
        
        // Always return true to allow sign in
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Log the redirect parameters for debugging
      console.log("NextAuth Redirect callback:", { url, baseUrl });
      
      // Handle callback URLs for email verification
      if (url.includes('/api/auth/callback/email')) {
        const callbackUrlParam = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrlParam) {
          const decodedCallbackUrl = decodeURIComponent(callbackUrlParam);
          console.log("Found callbackUrl in email verification:", decodedCallbackUrl);
          
          // If it's a relative URL, prepend the base URL
          if (decodedCallbackUrl.startsWith('/')) {
            const fullUrl = `${baseUrl}${decodedCallbackUrl}`;
            console.log("Redirecting to:", fullUrl);
            return fullUrl;
          }
          
          // If it's an absolute URL on the same origin, use it directly
          if (decodedCallbackUrl.startsWith(baseUrl)) {
            console.log("Redirecting to:", decodedCallbackUrl);
            return decodedCallbackUrl;
          }
        }
      }
      
      // If the URL starts with the base URL, allow it
      if (url.startsWith(baseUrl)) {
        console.log("Redirecting to same-origin URL:", url);
        return url;
      }
      
      // If the URL is a relative path, prepend the base URL
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log("Redirecting to relative URL:", fullUrl);
        return fullUrl;
      }
      
      // Default to the base URL
      console.log("Redirecting to default URL:", baseUrl);
      return baseUrl;
    },
    async session({ session, user, token }) {
      try {
        // When using database sessions, token is undefined and we should use user
        if (user) {
          return {
            ...session,
            user: {
              ...session.user,
              id: user.id,
              role: user.role,
              login: user.login,
              isAdmin: user.isAdmin,
            },
          };
        }
        
        // When using JWT sessions, user is undefined and we should use token
        if (token) {
          return {
            ...session,
            ...(token.accessToken ? { accessToken: token.accessToken } : {}),
          };
        }
        
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  debug: true, // Enable debug mode for troubleshooting
};

export const getServerAuthSession = () => getServerSession(authOptions);
