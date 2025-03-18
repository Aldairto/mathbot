"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface PdfDownloadButtonProps {
  title?: string
  contentSelector: string
  filename?: string
  className?: string
}

export default function PdfDownloadButton({
  title = "Mis Preguntas Correctas",
  contentSelector,
  filename = "historial_respuestas_correctas.pdf",
  className = "",
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Seleccionar el contenido a convertir en PDF
      const content = document.querySelector(contentSelector)

      if (!content) {
        throw new Error("No se encontró el contenido para generar el PDF")
      }

      // Crear una copia del contenido para manipularlo sin afectar la UI
      const contentClone = content.cloneNode(true) as HTMLElement

      // Aplicar estilos para mejorar la apariencia en el PDF
      contentClone.style.padding = "20px"
      contentClone.style.backgroundColor = "white"
      contentClone.style.color = "black"

      // Crear un contenedor temporal para renderizar el contenido
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"

      // Añadir título
      const titleElement = document.createElement("h1")
      titleElement.textContent = title
      titleElement.style.fontSize = "24px"
      titleElement.style.marginBottom = "20px"
      titleElement.style.color = "#2563eb"
      titleElement.style.borderBottom = "1px solid #e5e7eb"
      titleElement.style.paddingBottom = "10px"

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

