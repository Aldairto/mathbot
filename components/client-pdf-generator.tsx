"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

// Importar html2canvas y jsPDF de forma dinámica para evitar errores de SSR
const html2canvasModule = dynamic(() => import("html2canvas"), { ssr: false })
const jsPDFModule = dynamic(() => import("jspdf"), { ssr: false })

interface ClientPdfGeneratorProps {
  title?: string
  contentSelector: string
  filename?: string
  className?: string
}

export default function ClientPdfGenerator({
  title = "Mis Preguntas Correctas",
  contentSelector,
  filename = "historial_respuestas_correctas.pdf",
  className = "",
}: ClientPdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Cargar dinámicamente las bibliotecas
      const html2canvas = (await html2canvasModule).default
      const jsPDF = (await jsPDFModule).default

      // Seleccionar el contenido a convertir en PDF
      const content = document.querySelector(contentSelector)

      if (!content) {
        throw new Error(`No se encontró el contenido para generar el PDF (selector: ${contentSelector})`)
      }

      // Crear un contenedor temporal para renderizar el contenido
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"
      tempContainer.style.width = "800px" // Ancho fijo para el PDF
      tempContainer.style.padding = "20px"
      tempContainer.style.backgroundColor = "white"
      tempContainer.style.color = "black"

      // Añadir título
      const titleElement = document.createElement("h1")
      titleElement.textContent = title
      titleElement.style.fontSize = "24px"
      titleElement.style.marginBottom = "20px"
      titleElement.style.color = "#2563eb"
      titleElement.style.borderBottom = "1px solid #e5e7eb"
      titleElement.style.paddingBottom = "10px"

      // Clonar el contenido para no afectar el original
      const contentClone = content.cloneNode(true) as HTMLElement

      // Añadir elementos al contenedor temporal
      tempContainer.appendChild(titleElement)
      tempContainer.appendChild(contentClone)
      document.body.appendChild(tempContainer)

      // Cargar KaTeX CSS para asegurar que las fórmulas se rendericen correctamente
      const katexLink = document.createElement("link")
      katexLink.rel = "stylesheet"
      katexLink.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
      tempContainer.appendChild(katexLink)

      // Esperar a que se carguen los estilos
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Convertir el contenido a canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Crear PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Descargar PDF
      pdf.save(filename)

      // Limpiar
      document.body.removeChild(tempContainer)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      alert("Error al generar el PDF: " + (error instanceof Error ? error.message : "Error desconocido"))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePDF} variant="outline" size="sm" disabled={isGenerating} className={className}>
      {isGenerating ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </span>
      ) : (
        <span className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </span>
      )}
    </Button>
  )
}

