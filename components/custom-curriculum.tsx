'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function CustomCurriculum() {
  const [topics, setTopics] = useState([
    { id: 1, name: 'Álgebra lineal', selected: true },
    { id: 2, name: 'Cálculo diferencial', selected: true },
    { id: 3, name: 'Geometría analítica', selected: false },
    { id: 4, name: 'Probabilidad y estadística', selected: false },
    { id: 5, name: 'Trigonometría', selected: true },
  ])

  const handleTopicToggle = (id: number) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, selected: !topic.selected } : topic
    ))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personaliza tu temario</h3>
      <div className="space-y-2">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center space-x-2">
            <Checkbox
              id={`topic-${topic.id}`}
              checked={topic.selected}
              onCheckedChange={() => handleTopicToggle(topic.id)}
            />
            <Label htmlFor={`topic-${topic.id}`}>{topic.name}</Label>
          </div>
        ))}
      </div>
      <Button>Guardar cambios</Button>
    </div>
  )
}

