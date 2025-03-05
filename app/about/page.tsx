import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acerca de MathBot",
  description: "Información sobre MathBot, tu asistente de matemáticas personal",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Acerca de MathBot</h1>
      <p className="mb-4">
        MathBot es tu asistente de matemáticas personal, diseñado para ayudarte a aprender y practicar matemáticas de
        una manera interactiva y divertida.
      </p>
      <p className="mb-4">Con MathBot, puedes:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Resolver problemas matemáticos paso a paso</li>
        <li>Aprender nuevos conceptos con explicaciones claras</li>
        <li>Practicar con ejercicios adaptados a tu nivel</li>
        <li>Hacer preguntas y recibir respuestas instantáneas</li>
      </ul>
      <p>
        Ya sea que estés estudiando para un examen o simplemente quieras mejorar tus habilidades matemáticas, MathBot
        está aquí para ayudarte en tu viaje de aprendizaje.
      </p>
    </div>
  )
}

