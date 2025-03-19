import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"
import jsPDF from "jspdf"
import katex from "katex"

// Función para formatear expresiones matemáticas (similar a la original)
function formatMathExpression(text: string): string {
  // Mantener el mismo código de formateo que tenías antes
  const complexFormulas: { [key: string]: string } = {
    "s² = \\frac{\\sum_{i=1}^{n}(x_i - \\overline{x})²}{n - 1}": "s² = Σ(xᵢ - x̄)²/(n-1)",
    "{(2n)² - 1}": "(2n)² - 1",
    "P(A\\cap B)": "P(A∩B)",
    "\\theta = \\arctan(m)": "θ = arctan(m)",
    "m = \\tan(\\theta)": "m = tan(θ)",
    "\\frac{1}{2}": "½",
    "\\frac{1}{4}": "¼",
    "\\frac{3}{4}": "¾",
    "1/2": "½",
    "1/4": "¼",
    "3/4": "¾",
  }

  // Check if the text matches any complex formula
  if (complexFormulas[text]) {
    return complexFormulas[text]
  }

  // Mejorar el manejo de símbolos griegos y fracciones
  const specialSymbols = {
    "\\theta": "θ",
    "_": "θ", // Manejar guion bajo como theta
    "\\frac{1}{2}": "½",
    "\\frac{1}{4}": "¼",
    "\\frac{3}{4}": "¾",
    "1/2": "½",
    "1/4": "¼",
    "3/4": "¾",
  }

  // Reemplazar símbolos especiales
  let result = text
  for (const [pattern, replacement] of Object.entries(specialSymbols)) {
    result = result.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement)
  }

  // Resto del código sin cambios...
  return (
    result
      // Handle trigonometric functions
      .replace(/\\arctan/g, "arctan")
      .replace(/\\tan/g, "tan")
      .replace(/\\sin/g, "sin")
      .replace(/\\cos/g, "cos")
      .replace(/\\cot/g, "cot")
      .replace(/\\sec/g, "sec")
      .replace(/\\csc/g, "csc")
      // Handle special mathematical symbols
      .replace(/\\cap/g, "∩")
      .replace(/\\cup/g, "∪")
      .replace(/\\in/g, "∈")
      .replace(/\\subset/g, "⊂")
      .replace(/\\supset/g, "⊃")
      .replace(/\\emptyset/g, "∅")
      .replace(/\\infty/g, "∞")
      .replace(/\\sum/g, "Σ")
      .replace(/\\prod/g, "∏")
      // Handle superscripts and exponents
      .replace(/\^(\d+|{[^}]+})/g, (match, exp) => {
        const exponent = exp.startsWith("{") ? exp.slice(1, -1) : exp
        return superscriptNumber(exponent)
      })
      // Handle subscripts
      .replace(/_(\d+|{[^}]+})/g, (match, sub) => {
        const subscript = sub.startsWith("{") ? sub.slice(1, -1) : sub
        return subscriptNumber(subscript)
      })
      // Handle other mathematical formatting
      .replace(/\\overline{([^}]+)}/g, "$1̄")
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, "$1/$2")
      .replace(/\^°|\^\\circ|\^{\s*\\circ\s*}|\^{°}/g, "°")
      .replace(/([PQ])$$(\d+),\s*(\d+)$$/g, "$1($2, $3)")
      .replace(/\*/g, "×")
      .replace(/\+-/g, "±")
      // Clean up any remaining LaTeX commands and braces
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/[{}]/g, "")
      // Normalize spaces around operators and punctuation
      .replace(/\s*([=+\-×÷±<>])\s*/g, " $1 ")
      .replace(/\s*([,;])\s*/g, "$1 ")
      .trim()
  )
}

// Mantener las funciones de superíndice y subíndice
function superscriptNumber(num: string): string {
  const superscripts: { [key: string]: string } = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    "n": "ⁿ", "i": "ⁱ",
  }
  return num
    .split("")
    .map((char) => superscripts[char] || char)
    .join("")
}

function subscriptNumber(num: string): string {
  const subscripts: { [key: string]: string } = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "n": "ₙ", "x": "ₓ",
  }
  return num
    .split("")
    .map((char) => subscripts[char] || char)
    .join("")
}

// Nueva función para procesar expresiones matemáticas con KaTeX
async function processMathExpression(input: string): Promise<string> {
  try {
    if (!input || typeof input !== "string") {
      return ""
    }

    // Pre-process the text to handle common patterns
    let processedText = input.trim()

    // Manejar fracciones fuera de modo matemático
    const fractionReplacements = {
      "1/2": "½", "1/4": "¼", "3/4": "¾",
    }

    for (const [fraction, symbol] of Object.entries(fractionReplacements)) {
      processedText = processedText.replace(new RegExp(fraction, "g"), symbol)
    }

    // Handle LaTeX math expressions
    const mathRegex = /\$(.*?)\$/g
    const mathExpressions = processedText.match(mathRegex) || []

    for (const mathExpr of mathExpressions) {
      const latex = mathExpr.slice(1, -1)
      try {
        // First check if it's a complex formula
        const formattedExpr = formatMathExpression(latex)
        if (formattedExpr !== latex) {
          processedText = processedText.replace(mathExpr, formattedExpr)
          continue
        }

        // Si no es una fórmula compleja, intentar renderizar con KaTeX
        // Pero como estamos en un PDF, simplemente usamos el formateo básico
        processedText = processedText.replace(mathExpr, formattedExpr)
      } catch (error) {
        console.error("Error processing math expression:", error)
      }
    }

    // Process any remaining LaTeX-like expressions outside of math mode
    processedText = formatMathExpression(processedText)

    // Eliminar espacios excesivos entre caracteres
    return processedText
      .replace(/(?<=\S)\s+(?=\S)/g, " ") // Mantener un solo espacio entre palabras
      .replace(/\s*([.,;:!?])\s*/g, "$1 ") // Corregir espacios alrededor de puntuación
      .trim()
  } catch (error) {
    console.error("Error in processMathExpression:", error)
    return input
  }
}

// Modificar la función addAnswerToPDF para incluir la explicación
async function addAnswerToPDF(doc: jsPDF, answer: any, yOffset: number): Promise<number> {
  try {
    // Usar una fuente que soporte mejor los símbolos matemáticos
    doc.setFont("helvetica", "normal")

    const addText = async (text: string, x: number, y: number, options: any = {}) => {
      const defaultOptions = {
        charSpace: 0, // Reducir el espacio entre caracteres
        lineHeightFactor: 1.2,
        maxWidth: 180,
        align: "left",
      }

      // Preserve spaces in titles and regular text
      let processedText = text
      if (text.includes("\\") || text.includes("$") || text.includes("_") || text.includes("/")) {
        processedText = await processMathExpression(text)
      }

      // Verificar si hay símbolos especiales
      if (/[θαβγδεφπμΣ∞∫∂½¼¾]/u.test(processedText)) {
        const lines = doc.splitTextToSize(processedText, defaultOptions.maxWidth)
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], x, y + i * 6, { ...defaultOptions, ...options })
        }
        return y + lines.length * 6
      } else {
        doc.text(processedText, x, y, { ...defaultOptions, ...options })
        return y
      }
    }

    // Title section with preserved spaces
    doc.setFillColor(245, 245, 245)
    doc.rect(10, yOffset - 4, 190, 12, "F")
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    yOffset = (await addText(`${answer.mainTopic} - ${answer.subTopic}`, 14, yOffset + 4)) || yOffset + 4
    yOffset += 12

    // Question section
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const processedQuestion = await processMathExpression(answer.question)

    await addText("Pregunta:", 14, yOffset)
    const labelWidth = doc.getTextWidth("Pregunta: ")

    const questionLines = doc.splitTextToSize(processedQuestion, 180)
    for (let i = 0; i < questionLines.length; i++) {
      const xPos = i === 0 ? 14 + labelWidth : 14
      await addText(questionLines[i], xPos, yOffset + i * 6)
    }
    yOffset += questionLines.length * 6 + 4

    // Answer section
    doc.setTextColor(0, 102, 204)

    const processedAnswer = await processMathExpression(answer.answer)

    await addText("Respuesta:", 14, yOffset)
    const answerLabelWidth = doc.getTextWidth("Respuesta: ")

    const answerLines = doc.splitTextToSize(processedAnswer, 180)
    for (let i = 0; i < answerLines.length; i++) {
      const xPos = i === 0 ? 14 + answerLabelWidth : 14
      await addText(answerLines[i], xPos, yOffset + i * 6)
    }
    yOffset += answerLines.length * 6 + 4

    // Explanation section (nuevo)
    if (answer.explanation) {
      doc.setTextColor(0, 128, 0) // Color verde para la explicación
      
      const processedExplanation = await processMathExpression(answer.explanation)
      
      await addText("Explicación:", 14, yOffset)
      const explanationLabelWidth = doc.getTextWidth("Explicación: ")
      
      const explanationLines = doc.splitTextToSize(processedExplanation, 180)
      for (let i = 0; i < explanationLines.length; i++) {
        const xPos = i === 0 ? 14 + explanationLabelWidth : 14
        await addText(explanationLines[i], xPos, yOffset + i * 6)
      }
      yOffset += explanationLines.length * 6 + 4
    }

    // Date section
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    await addText(new Date(answer.createdAt).toLocaleString(), 14, yOffset)
    yOffset += 8

    // Separator
    doc.setDrawColor(230, 230, 230)
    doc.line(14, yOffset, 196, yOffset)
    yOffset += 12

    return yOffset
  } catch (error) {
    console.error("Error in addAnswerToPDF:", error)
    throw error
  }
}

// Mantener la función addErrorToPDF igual
function addErrorToPDF(doc: jsPDF, error: any, yOffset: number): number {
  doc.setTextColor(255, 0, 0)
  doc.setFontSize(10)
  const errorMessage = `Error: ${error.message || "Error desconocido"}`
  const lines = doc.splitTextToSize(errorMessage, 180)
  doc.text(lines, 14, yOffset, { charSpace: 0 })
  return yOffset + lines.length * 12 + 10
}

// El handler principal se mantiene casi igual
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: "No autorizado" })
  }

  try {
    const { selectedTopic } = req.body

    const correctAnswers = await prisma.correctAnswer.findMany({
      where: {
        userId: session.user.id,
        ...(selectedTopic !== "all" ? { mainTopic: selectedTopic } : {}),
      },
      orderBy: { createdAt: "desc" },
    })

    if (correctAnswers.length === 0) {
      return res.status(404).json({ error: "No se encontraron respuestas correctas" })
    }

    const doc = new jsPDF()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(18)
    doc.text("Historial de Respuestas Correctas", 14, 22)

    let yOffset = 30

    for (const answer of correctAnswers) {
      try {
        yOffset = await addAnswerToPDF(doc, answer, yOffset)

        if (yOffset > 280) {
          doc.addPage()
          yOffset = 20
        }
      } catch (error) {
        console.error(`Error al procesar respuesta: ${error}`)
        yOffset = addErrorToPDF(doc, error, yOffset)
      }
    }

    const pdfBuffer = doc.output("arraybuffer")

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=historial_respuestas_correctas.pdf")
    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    console.error("Error al generar el PDF:", error)
    res.status(500).json({ error: "Error al generar el PDF", details: error.message })
  }
}