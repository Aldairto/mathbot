import type { Metadata } from "next"
import { UserSettings } from "@/components/user-settings"

export const metadata: Metadata = {
  title: "Configuración - MathBot",
  description: "Personaliza tus preferencias de usuario",
}

export default function SettingsPage() {
  return (
    <div className="container py-8 mx-auto px-4 dark:bg-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-8">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Ajusta tus preferencias.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
          <UserSettings />
        </div>
      </div>
    </div>
  )
}
