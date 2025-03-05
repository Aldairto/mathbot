import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Award, Brain } from "lucide-react"

type QuizResult = {
  mainTopic: string
  subTopic: string
  correctCount: number
  incorrectCount: number
}

type LearningStatsProps = {
  quizResults: QuizResult[]
}

export function LearningStats({ quizResults }: LearningStatsProps) {
  const totalQuestions = quizResults.reduce((sum, result) => sum + result.correctCount + result.incorrectCount, 0)
  const correctQuestions = quizResults.reduce((sum, result) => sum + result.correctCount, 0)
  const uniqueTopics = new Set(quizResults.map((result) => result.mainTopic)).size

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preguntas respondidas</CardTitle>
          <Award className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{totalQuestions}</div>
          <p className="text-xs text-blue-600">{correctQuestions} correctas</p>
        </CardContent>
      </Card>
      <Card className="bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precisión</CardTitle>
          <Brain className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {totalQuestions > 0 ? ((correctQuestions / totalQuestions) * 100).toFixed(2) : 0}%
          </div>
          <p className="text-xs text-green-600">Porcentaje de respuestas correctas</p>
        </CardContent>
      </Card>
      <Card className="bg-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temas cubiertos</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">{uniqueTopics}</div>
          <p className="text-xs text-orange-600">Temas principales estudiados</p>
        </CardContent>
      </Card>
    </div>
  )
}

