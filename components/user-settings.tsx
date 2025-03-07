"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

export function UserSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const { data: session, update } = useSession()

  // useEffect para manejar la hidratación del componente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name)
    }
  }, [session])

  const handleSave = async () => {
    try {
      // Guardar el nombre de usuario
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el nombre de usuario")
      }

      // Actualizar la sesión con el nuevo nombre de usuario
      await update({ name: username })

      // Guardar el tamaño de fuente en localStorage
      localStorage.setItem("fontSize", fontSize)

      // Aplicar el tamaño de fuente
      document.documentElement.style.fontSize = getFontSizeValue(fontSize)

      alert("Configuración guardada con éxito")
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      alert("Error al guardar la configuración")
    }
  }

  const getFontSizeValue = (size: string) => {
    switch (size) {
      case "small":
        return "14px"
      case "medium":
        return "16px"
      case "large":
        return "18px"
      default:
        return "16px"
    }
  }

  // Evitar el problema de hidratación
  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="darkMode">Modo oscuro</Label>
        <Switch
          id="darkMode"
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fontSize">Tamaño de letra</Label>
        <Select value={fontSize} onValueChange={setFontSize}>
          <SelectTrigger id="fontSize">
            <SelectValue placeholder="Selecciona el tamaño de letra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Pequeño</SelectItem>
            <SelectItem value="medium">Mediano</SelectItem>
            <SelectItem value="large">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingresa tu nombre de usuario"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico:</Label>
        <Input
          id="email"
          value={session?.user?.email || ''}
          readOnly
            disabled
            className="bg-muted cursor-not-allowed"
        />
      </div>

      <Button onClick={handleSave}>Guardar configuración</Button>
    </div>
  )
}

