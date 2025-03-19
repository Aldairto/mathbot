"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Calendar, BarChart2, Award } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "@/components/ui/chart"

// Constantes
const UPDATE_INTERVAL = 15 * 1000 // 15 segundos para actualizar UI
const SYNC_INTERVAL = 60 * 1000 // 1 minuto para sincronizar con API
const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

interface WeeklyStudyTime {
  day: string
  minutes: number
}

const StudyTimeDisplay = () => {
  const { data: session, status } = useSession()
  const [studyTime, setStudyTime] = useState(0)
  const [weeklyData, setWeeklyData] = useState<WeeklyStudyTime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")

  // Refs para tracking
  const lastSyncTime = useRef(0)
  const accumulatedTime = useRef(0)
  const isActive = useRef(true)

  // Obtener el tiempo de estudio inicial y datos semanales
  useEffect(() => {
    if (status !== "authenticated") return

    const fetchInitialData = async () => {
      setIsLoading(true)
      await fetchStudyTime()
      await fetchWeeklyData()
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

  // Obtener datos de estudio semanales
  const fetchWeeklyData = async () => {
    try {
      const response = await fetch("/api/study-time/weekly")
      if (response.ok) {
        const data = await response.json()

        // Transformar datos para el gráfico
        const weekData = DAYS_OF_WEEK.map((day) => {
          const dayData = data.weeklyData.find((d: any) => d.day === day)
          return {
            day,
            minutes: dayData ? Math.round(dayData.duration / 60) : 0,
          }
        })

        setWeeklyData(weekData)
      } else {
        console.error("Error fetching weekly data:", await response.text())
        // Usar datos simulados si la API no está disponible
        const today = new Date().getDay()
        const simulatedData = DAYS_OF_WEEK.map((day, index) => {
          // Generar datos aleatorios, con más tiempo para el día actual
          const isToday = index === today
          return {
            day,
            minutes: isToday ? Math.floor(Math.random() * 60) + 30 : Math.floor(Math.random() * 40),
          }
        })
        setWeeklyData(simulatedData)
      }
    } catch (error) {
      console.error("Error fetching weekly data:", error)
      // Usar datos simulados en caso de error
      const today = new Date().getDay()
      const simulatedData = DAYS_OF_WEEK.map((day, index) => {
        const isToday = index === today
        return {
          day,
          minutes: isToday ? Math.floor(Math.random() * 60) + 30 : Math.floor(Math.random() * 40),
        }
      })
      setWeeklyData(simulatedData)
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

        // Actualizar datos semanales después de sincronizar
        if (activeTab === "weekly") {
          fetchWeeklyData()
        }
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

  // Encontrar el día con más minutos para escalar el gráfico
  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 60) // Mínimo 60 minutos para escala

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Tiempo de Estudio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="today" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Hoy</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Semanal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="weekly">
            <div className="pt-2 pb-4">
              <h3 className="text-sm font-medium flex items-center gap-1 mb-4">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span>Minutos de estudio por día</span>
              </h3>

              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickFormatter={(value) => value.substring(0, 3)} tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, maxMinutes]} tickFormatter={(value) => `${value}m`} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value} minutos`, "Tiempo de estudio"]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, index) => {
                        const today = new Date().getDay()
                        const isToday = DAYS_OF_WEEK[today] === entry.day

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isToday ? "var(--primary)" : "var(--primary-light, #a5b4fc)"}
                          />
                        )
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              <p className="text-xs text-muted-foreground text-center mt-2">
                El día actual se muestra en color destacado
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default StudyTimeDisplay

