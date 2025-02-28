import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Log the environment variables for debugging
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Not set");
console.log("AUTH_PROVIDERS:", authOptions.providers.map(p => p.id).join(", "));

// Use the authOptions directly without overriding
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
