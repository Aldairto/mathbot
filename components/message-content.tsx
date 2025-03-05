import { InlineMath, BlockMath } from "react-katex"
import "katex/dist/katex.min.css"

type MessageContentProps = {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  // Función para procesar el contenido y formatear correctamente las expresiones LaTeX
  const processContent = (text: string) => {
    // Primero, reemplazamos los delimitadores $$ $$ y \[ \] por $ $ y $$ $$ respectivamente
    let processed = text
      .replace(/\\$$(.*?)\\$$/g, "$$$1$$")
      .replace(/\\\[(.*?)\\\]/g, "$$$$1$$")
      .replace(/\\+/g, "\\")

    // Identificar fórmulas existentes con delimitadores
    const hasDelimiters = processed.includes("$")

    if (!hasDelimiters) {
      // Si no hay delimitadores, intentamos identificar expresiones LaTeX
      processed = processed
        .replace(/\\[a-zA-Z]+{[^}]*}/g, (match) => `$${match}$`)
        .replace(/\\[a-zA-Z]+/g, (match) => `$${match}$`)
    }

    // Dividir el contenido en partes: texto y matemáticas
    const parts = processed.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g)

    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        // Fórmula en bloque
        const math = part.slice(2, -2).trim()
        return (
          <div key={index} className="my-2 p-2 bg-muted rounded overflow-x-auto">
            <BlockMath math={math} />
          </div>
        )
      } else if (part.startsWith("$") && part.endsWith("$")) {
        // Fórmula en línea
        const math = part.slice(1, -1).trim()
        return <InlineMath key={index} math={math} />
      } else if (part.trim()) {
        // Texto normal
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      }
      return null
    })
  }

  return <div className="text-current">{processContent(content)}</div>
}

