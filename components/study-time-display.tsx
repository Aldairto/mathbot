"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Award } from "lucide-react"

// Constantes
const UPDATE_INTERVAL = 15 * 1000 // 15 segundos para actualizar UI
const SYNC_INTERVAL = 60 * 1000 // 1 minuto para sincronizar con API

const StudyTimeDisplay = () => {
  const { data: session, status } = useSession()
  const [studyTime, setStudyTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Refs para tracking
  const lastSyncTime = useRef(0)
  const accumulatedTime = useRef(0)
  const isActive = useRef(true)

  // Obtener el tiempo de estudio inicial
  useEffect(() => {
    if (status !== "authenticated") return

    const fetchInitialData = async () => {
      setIsLoading(true)
      await fetchStudyTime()
      setIsLoading(false)
    }

    fetchInitialData()

    // Limpiar cuando el componente se desmonte
    return () => {
      syncStudyTime()
    }
  }, [status])

  // Configurar intervalos para actualizar UI y sincronizar con API
  useEffect(() => {
    if (status !== "authenticated") return

    // Actualizar UI cada 15 segundos
    const uiTimer = setInterval(() => {
      if (isActive.current) {
        setStudyTime((prevTime) => {
          const newTime = prevTime + UPDATE_INTERVAL / 1000
          accumulatedTime.current += UPDATE_INTERVAL / 1000
          return newTime
        })
      }
    }, UPDATE_INTERVAL)

    // Sincronizar con API cada minuto
    const syncTimer = setInterval(() => {
      if (accumulatedTime.current > 0) {
        syncStudyTime()
      }
    }, SYNC_INTERVAL)

    // Evento para cuando el usuario cierra la página
    const handleBeforeUnload = () => {
      syncStudyTime()
    }

    // Eventos para detectar si la pestaña está activa
    const handleVisibilityChange = () => {
      isActive.current = document.visibilityState === "visible"
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(uiTimer)
      clearInterval(syncTimer)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status])

  // Obtener tiempo de estudio total
  const fetchStudyTime = async () => {
    try {
      const response = await fetch("/api/study-time")
      if (response.ok) {
        const data = await response.json()
        setStudyTime(data.studyTime || 0)
        lastSyncTime.current = Date.now()
        accumulatedTime.current = 0
      } else {
        console.error("Error fetching study time:", await response.text())
      }
    } catch (error) {
      console.error("Error fetching study time:", error)
    }
  }

  // Sincronizar tiempo acumulado con el servidor
  const syncStudyTime = async () => {
    if (accumulatedTime.current <= 0) return

    try {
      const secondsToSync = Math.floor(accumulatedTime.current)

      const response = await fetch("/api/study-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seconds: secondsToSync }),
      })

      if (response.ok) {
        accumulatedTime.current = 0
        lastSyncTime.current = Date.now()
      } else {
        console.error("Error syncing study time:", await response.text())
      }
    } catch (error) {
      console.error("Error syncing study time:", error)
    }
  }

  // Formatear tiempo en formato HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Calcular el progreso diario (objetivo: 2 horas = 7200 segundos)
  const calculateDailyProgress = () => {
    const dailyGoal = 7200 // 2 horas en segundos
    return Math.min(Math.round((studyTime / dailyGoal) * 100), 100)
  }

  // No renderizar nada si la sesión no está autenticada
  if (status !== "authenticated") {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Tiempo de Estudio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-4xl font-bold text-primary">{formatTime(studyTime)}</div>
            <p className="text-sm text-muted-foreground mt-1">Tiempo total de estudio</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso diario</span>
              <span className="font-medium">{calculateDailyProgress()}%</span>
            </div>
            <Progress value={calculateDailyProgress()} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">Meta: 2 horas diarias</p>
          </div>

          {studyTime >= 7200 && (
            <div className="flex items-center justify-center gap-2 mt-4 p-2 bg-primary/10 rounded-md">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">¡Meta diaria alcanzada!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StudyTimeDisplay

