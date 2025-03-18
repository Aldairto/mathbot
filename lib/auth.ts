// Archivo centralizado para configuración de autenticación
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// Comentamos la importación de bcryptjs temporalmente
// import bcrypt from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        // Implementación temporal sin bcrypt
        console.warn("Usando comparación simple para contraseñas (solo para desarrollo)")
        const isPasswordValid =
          credentials.password === user.password ||
          (process.env.NODE_ENV !== "production" && credentials.password === user.password.replace("hashed_", ""))

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
  },
}

// Tipos para extender la sesión de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

// Función de ayuda para verificar roles
export function hasRequiredRole(session: any, requiredRoles: string[]): boolean {
  if (!session || !session.user || !session.user.role) {
    return false
  }
  return requiredRoles.includes(session.user.role)
}

// Función para verificar autenticación en el servidor
export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

// Función para verificar autenticación en el cliente
export function useRequireAuth(redirectTo = "/login") {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push(redirectTo)
    }
  }, [session, status, router, redirectTo])
  
  return { session, status }
}

// Función para verificar rol en el cliente
export function useRequireRole(requiredRoles: string[], redirectTo = "/unauthorized") {
  const { session, status } = useRequireAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (status === "loading") return
    if (session && !hasRequiredRole(session, requiredRoles)) {
      router.push(redirectTo)
    }
  }, [session, status, router, redirectTo, requiredRoles])
  
  return { session, status, hasRole: session ? hasRequiredRole(session, requiredRoles) : false }
}