import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await dbConnect();

        // Retrieve user including password field
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");

        if (!user || !user.isActive) {
          throw new Error("User account not found or deactivated");
        }

        // Equivalence comparison for design skeleton
        const isPasswordCorrect = credentials.password === user.password; 

        if (!isPasswordCorrect) {
          throw new Error("Invalid password credentials");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId.toString(),
        };
      }
    })
  ]
})
