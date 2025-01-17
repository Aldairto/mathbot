import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProgress } from '@/components/user-progress'
import { LearningStats } from '@/components/learning-stats'
import { CustomCurriculum } from '@/components/custom-curriculum'

export const metadata: Metadata = {
  title: 'Panel de Control - MathBot',
  description: 'Tu progreso y estadísticas de aprendizaje',
}

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Panel de Control</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Progreso General</CardTitle>
            <CardDescription>Tu avance en el aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={33} className="w-full h-4 mb-2" />
            <p className="text-sm text-muted-foreground">Has completado el 33% del curso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Estadísticas de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningStats />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Progreso Detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <UserProgress />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Temario Personalizado</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomCurriculum />
        </CardContent>
      </Card>
    </div>
  )
}

