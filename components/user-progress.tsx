import { Progress } from "@/components/ui/progress"

type QuizResult = {
  mainTopic: string
  subTopic: string
  correctCount: number
  incorrectCount: number
}

type UserProgressProps = {
  quizResults: QuizResult[]
}

export function UserProgress({ quizResults }: UserProgressProps) {
  const topicProgress = quizResults.reduce(
    (acc, result) => {
      if (!acc[result.mainTopic]) {
        acc[result.mainTopic] = { correct: 0, total: 0 }
      }
      acc[result.mainTopic].correct += result.correctCount
      acc[result.mainTopic].total += result.correctCount + result.incorrectCount
      return acc
    },
    {} as Record<string, { correct: number; total: number }>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(topicProgress).map(([topic, progress]) => (
        <div key={topic} className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{topic}</span>
            <span className="text-sm text-muted-foreground">
              {progress.correct} / {progress.total} ({((progress.correct / progress.total) * 100).toFixed(2)}%)
            </span>
          </div>
          <Progress value={(progress.correct / progress.total) * 100} className="w-full" />
        </div>
      ))}
    </div>
  )
}

