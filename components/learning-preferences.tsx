'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

export function LearningPreferences() {
  const [difficulty, setDifficulty] = useState('medium')
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    // Aquí iría la lógica para guardar las preferencias
    console.log('Preferencias guardadas:', { difficulty, notifications })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Dificultad de los ejercicios</h2>
        <RadioGroup value={difficulty} onValueChange={setDifficulty}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="difficulty-easy" />
            <Label htmlFor="difficulty-easy">Fácil</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="difficulty-medium" />
            <Label htmlFor="difficulty-medium">Medio</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="difficulty-hard" />
            <Label htmlFor="difficulty-hard">Difícil</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="notifications"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
        <Label htmlFor="notifications">Recibir notificaciones de recordatorio</Label>
      </div>
      <Button onClick={handleSave}>Guardar preferencias</Button>
    </div>
  )
}

