import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Providers } from "./providers"
import "katex/dist/katex.min.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MathBot - Tu asistente de matemáticas personal",
  description: "Aprende matemáticas de forma interactiva con nuestro chatbot inteligente",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            const fontSize = localStorage.getItem('fontSize');
            if (fontSize) {
              document.documentElement.style.fontSize = {
                small: '14px',
                medium: '16px',
                large: '18px'
              }[fontSize] || '16px';
            }
          `,
          }}
        />
      </body>
    </html>
  )
}