import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { name, email, password } = req.body

    // Validación de campos
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Faltan campos requeridos",
        details: {
          name: !name ? "Nombre es requerido" : null,
          email: !email ? "Email es requerido" : null,
          password: !password ? "Contraseña es requerida" : null,
        },
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario y inicializar su progreso
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        adaptiveCurriculum: {
          create: {}, // Crea un currículo adaptativo vacío para el usuario
        },
        quizResults: {
          create: [], // Puedes agregar resultados iniciales si lo deseas
        },
        studyTimes: {
          create: {
            duration: 0, // Inicializa el tiempo de estudio en 0
          },
        },
      },
    })

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Error en el registro:", error)
    res.status(500).json({ error: "Error al crear el usuario" })
  }
}

