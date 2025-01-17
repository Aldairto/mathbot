import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Award, Brain } from 'lucide-react'

export function LearningStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo de estudio</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">4h 32m</div>
          <p className="text-xs text-blue-600">+20% que la semana pasada</p>
        </CardContent>
      </Card>
      <Card className="bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ejercicios completados</CardTitle>
          <Award className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">128</div>
          <p className="text-xs text-green-600">+12 desde ayer</p>
        </CardContent>
      </Card>
      <Card className="bg-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conceptos aprendidos</CardTitle>
          <Brain className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">24</div>
          <p className="text-xs text-orange-600">+3 esta semana</p>
        </CardContent>
      </Card>
    </div>
  )
}

