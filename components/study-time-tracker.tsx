"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const FIVE_MINUTES = 5 * 60 * 1000 // 5 minutos en milisegundos

const StudyTimeTracker = () => {
  const session = useSession()
  const [studyTime, setStudyTime] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

  useEffect(() => {
    if (!session || session.status !== "authenticated") return

    const timer = setInterval(() => {
      const now = Date.now()
      const elapsedTime = Math.floor((now - lastUpdateTime) / 1000)
      setStudyTime((prevTime) => prevTime + elapsedTime)

      if (elapsedTime >= 300) {
        updateStudyTime(elapsedTime)
        setLastUpdateTime(now)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session, lastUpdateTime])

  const updateStudyTime = async (seconds: number) => {
    try {
      const response = await fetch("/api/study-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds }),
      })
      if (!response.ok) {
        throw new Error("Failed to update study time")
      }
    } catch (error) {
      console.error("Error updating study time:", error)
    }
  }

  if (!session || session.status !== "authenticated") {
    return null
  }

  return (
    <div>
      <h2>Study Time: {formatTime(studyTime)}</h2>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default StudyTimeTracker

