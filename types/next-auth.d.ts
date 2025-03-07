import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extiende el tipo User de NextAuth
   */
  interface User extends DefaultUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    password?: string | null
    // Puedes agregar más campos personalizados aquí
  }

  /**
   * Extiende el tipo Session de NextAuth
   * Esto es lo que se devuelve cuando usas useSession() o getSession()
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      // No incluyas password aquí por seguridad
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende el tipo JWT de NextAuth
   * Esto es lo que se almacena en el token JWT
   */
  interface JWT {
    id: string
    // Puedes agregar más campos personalizados aquí
  }
}