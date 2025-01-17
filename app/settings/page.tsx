import { Metadata } from 'next'
import { LearningPreferences } from '@/components/learning-preferences'

export const metadata: Metadata = {
  title: 'Configuración - MathBot',
  description: 'Personaliza tus preferencias de aprendizaje',
}

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      <LearningPreferences />
    </div>
  )
}

