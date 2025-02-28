import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Log the environment variables for debugging
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Not set");
console.log("AUTH_PROVIDERS:", authOptions.providers.map(p => p.id).join(", "));

// Create a handler with more detailed logging
const handler = NextAuth({
  ...authOptions,
  debug: true, // Enable debug mode for more detailed logs
  callbacks: {
    ...authOptions.callbacks,
    async redirect({ url, baseUrl }) {
      console.log("NextAuth Redirect:", { url, baseUrl });
      
      // Always allow relative URLs
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log("Redirecting to relative URL:", fullUrl);
        return fullUrl;
      }
      
      // Allow URLs on the same origin
      if (url.startsWith(baseUrl)) {
        console.log("Redirecting to same origin URL:", url);
        return url;
      }
      
      console.log("Redirecting to default URL:", baseUrl);
      return baseUrl;
    }
  }
});

export { handler as GET, handler as POST };
