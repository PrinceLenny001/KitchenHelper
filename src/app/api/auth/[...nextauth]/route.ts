import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Log the environment variables for debugging
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
