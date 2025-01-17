import { Progress } from '@/components/ui/progress'

export function UserProgress() {
  const topics = [
    { name: 'Álgebra', progress: 75 },
    { name: 'Geometría', progress: 60 },
    { name: 'Cálculo', progress: 40 },
    { name: 'Estadística', progress: 30 },
  ]

  return (
    <div className="space-y-6">
      {topics.map((topic) => (
        <div key={topic.name} className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{topic.name}</span>
            <span className="text-sm text-muted-foreground">{topic.progress}%</span>
          </div>
          <Progress value={topic.progress} className="w-full" />
        </div>
      ))}
    </div>
  )
}

