import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// Comentamos la importación de bcryptjs temporalmente
// import bcrypt from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function hashPassword(password: string): Promise<string> {
  // Implementación temporal sin bcrypt
  console.warn("Usando hash simple para contraseñas (solo para desarrollo)")
  return `hashed_${password}`
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // Implementación temporal sin bcrypt
  console.warn("Usando comparación simple para contraseñas (solo para desarrollo)")
  return hashedPassword === `hashed_${plainPassword}`
}

