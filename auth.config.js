export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.id = token.id;
      }
      return session;
    }
  },
  providers: [], // Configured dynamically in auth.js to avoid loading Mongoose in Edge middleware
  session: {
    strategy: "jwt",
  },
}
