/**
 * Utilidades para la generación de PDFs con fórmulas matemáticas
 */

// Función para pre-renderizar fórmulas matemáticas en un elemento HTML
export async function prepareElementForPdf(element: HTMLElement): Promise<void> {
    // Asegurarse de que KaTeX esté cargado
    if (!document.querySelector('link[href*="katex"]')) {
      const katexLink = document.createElement("link")
      katexLink.rel = "stylesheet"
      katexLink.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
      document.head.appendChild(katexLink)
  
      // Esperar a que se cargue KaTeX
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  
    // Aplicar estilos adicionales para mejorar la apariencia en el PDF
    element.querySelectorAll(".katex-display").forEach((el) => {
      ;(el as HTMLElement).style.margin = "1em 0"(
        // Asegurarse de que las fórmulas en bloque tengan suficiente espacio
        el as HTMLElement,
      ).style.overflow = "visible"
    })
  
    element.querySelectorAll(".katex").forEach((el) => {
      // Asegurarse de que las fórmulas inline tengan suficiente espacio
      ;(el as HTMLElement).style.overflow = "visible"
    })
  }
  
  // Función para optimizar la configuración de html2canvas para fórmulas matemáticas
  export function getHtml2CanvasOptions() {
    return {
      scale: 2, // Mayor calidad
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc: Document) => {
        // Copiar los estilos de KaTeX al documento clonado
        const katexStyles = document.querySelectorAll('style[data-katex], link[href*="katex"]')
        katexStyles.forEach((style) => {
          clonedDoc.head.appendChild(style.cloneNode(true))
        })
      },
    }
  }
  
  