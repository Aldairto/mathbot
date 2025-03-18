import type { Metadata } from "next"
import { UserSettings } from "@/components/user-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Configuración - MathBot",
  description: "Personaliza tus preferencias de usuario y ajusta la configuración de tu experiencia de aprendizaje",
}

export default function SettingsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Personaliza tu experiencia de aprendizaje y ajusta tus preferencias.
          </p>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>
              Administra tu información personal y preferencias de cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings section="profile" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza la apariencia visual de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings section="appearance" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Configura cómo y cuándo quieres recibir notificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings section="notifications" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de Aprendizaje</CardTitle>
            <CardDescription>
              Ajusta cómo quieres aprender y practicar matemáticas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings section="learning" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacidad y Seguridad</CardTitle>
            <CardDescription>
              Administra la configuración de privacidad y seguridad de tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings section="privacy" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}