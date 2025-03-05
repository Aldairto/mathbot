"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const StudyTimeDisplay = () => {
  const session = useSession()
  const [studyTime, setStudyTime] = useState(0)

  useEffect(() => {
    if (!session || session.status !== "authenticated") return

    // Obtener el tiempo de estudio inicial
    fetchStudyTime()

    // Actualizar el tiempo de estudio cada segundo para la UI
    const timer = setInterval(() => {
      setStudyTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [session])

  const fetchStudyTime = async () => {
    try {
      const response = await fetch("/api/study-time")
      if (response.ok) {
        const data = await response.json()
        setStudyTime(data.studyTime || 0)
      } else {
        throw new Error("Failed to fetch study time")
      }
    } catch (error) {
      console.error("Error fetching study time:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // No renderizar nada si la sesión no está autenticada
  if (!session || session.status !== "authenticated") {
    return null
  }

  return (
    <div>
      <h2>Tiempo de estudio</h2>
      <p>{formatTime(studyTime)}</p>
    </div>
  )
}

export default StudyTimeDisplay

