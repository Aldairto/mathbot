import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { InlineMath, BlockMath } from "react-katex"
import "katex/dist/katex.min.css"

type MessageProps = {
  content: string
  role: "assistant" | "user"
}

export function ChatMessage({ content, role }: MessageProps) {
  const formattedContent = formatMessage(content)
  const isUser = role === "user"

  return (
    <Card
      className={`mb-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
    >
      <CardContent className="p-4 whitespace-pre-wrap break-words">
        {formattedContent.map((part, index) => (
          <React.Fragment key={index}>
            {part.type === "text" && (
              <span
                className="text-current"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(part.content) }}
              />
            )}
            {part.type === "math" && (
              <div className={`my-2 p-2 rounded overflow-x-auto ${isUser ? "user-math-block" : "bg-muted"}`}>
                <BlockMath math={part.content} />
              </div>
            )}
            {part.type === "inlineMath" && (
              <span className={`inline-block align-middle ${isUser ? "user-math-inline" : ""}`}>
                <InlineMath math={part.content} />
              </span>
            )}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

function formatMessage(content: string) {
  const parts = []
  let currentText = ""
  let inMath = false
  let mathContent = ""
  let isBlockMath = false

  const pushText = () => {
    if (currentText) {
      parts.push({ type: "text", content: currentText })
      currentText = ""
    }
  }

  const pushMath = () => {
    if (mathContent) {
      parts.push({ type: isBlockMath ? "math" : "inlineMath", content: mathContent.trim() })
      mathContent = ""
    }
  }

  const lines = content.split("\n")
  lines.forEach((line, lineIndex) => {
    let i = 0
    while (i < line.length) {
      if (line[i] === "$") {
        if (i + 1 < line.length && line[i + 1] === "$") {
          // Block math
          if (inMath) {
            pushMath()
            inMath = false
            isBlockMath = false
            i += 2 // Skip $$
          } else {
            pushText()
            inMath = true
            isBlockMath = true
            i += 2 // Skip $$
          }
        } else {
          // Inline math
          if (inMath) {
            pushMath()
            inMath = false
            isBlockMath = false
          } else {
            pushText()
            inMath = true
            isBlockMath = false
          }
          i++
        }
      } else if (inMath) {
        mathContent += line[i]
        i++
      } else {
        currentText += line[i]
        i++
      }
    }

    // End of line
    if (!inMath) {
      currentText += "\n"
    } else if (isBlockMath) {
      mathContent += "\n"
    }

    // If it's the last line, push any remaining content
    if (lineIndex === lines.length - 1) {
      pushText()
      if (inMath) {
        pushMath()
      }
    }
  })

  return parts
}

function convertMarkdownToHtml(text: string) {
  // Convert bold (** or __) to <strong>
  text = text.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>")

  // Convert italic (* or _) to <em>
  text = text.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>")

  // Convert line breaks to <br>
  text = text.replace(/\n/g, "<br>")

  return text
}

