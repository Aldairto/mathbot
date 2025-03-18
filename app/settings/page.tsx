import type { Metadata } from "next"
import { UserSettings } from "@/components/user-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BellRing, BookOpen, Palette, Shield, User } from 'lucide-react'

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
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Aprendizaje</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidad</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
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
          </TabsContent>
          
          <TabsContent value="appearance">
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
          </TabsContent>
          
          <TabsContent value="notifications">
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
          </TabsContent>
          
          <TabsContent value="learning">
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
          </TabsContent>
          
          <TabsContent value="privacy">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}