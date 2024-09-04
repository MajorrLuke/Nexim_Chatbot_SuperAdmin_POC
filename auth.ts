import NextAuth from "next-auth"
import "next-auth/jwt"




import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"


import type { NextAuthConfig } from "next-auth"



const config = {
  theme: { logo: "/logo.png" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" }
      },
      authorize: async (credentials) => {
        const user = await fetch(`${process.env.NEXTAUTH_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        }).then(response => response.json());

        //console.log(user);

        if (user && user.role) {
          // Return user object with role
          return { ...user, role: user.role }
        } else {
          return false
        }
      }
    }),
    //Google,
  ],
  trustHost: true,
  basePath: "/api/auth", // Remove the trailing slash
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as string;
        token.tenant = user.tenant as string;
      }
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      if (session.user) {
        session.user.role = token.role
        session.user.tenant = token.tenant
      }
      return session
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
  debug: process.env.NODE_ENV !== "production" ? true : false,
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

declare module "next-auth" {
  interface User {
    role?: string
    tenant?: string // Add this line
  }
  interface Session {
    accessToken?: string
    user: {
      role: string
      tenant: string
      email: string
      image: string
      name: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    role: string
    tenant: string
    email: string
    image: string
    name: string
  }
}