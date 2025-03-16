import { NextResponse } from "next/server"

export async function GET() {
  // Recopilar información sobre la región y el entorno
  const regionInfo = {
    region: process.env.VERCEL_REGION || "desconocida",
    environment: process.env.VERCEL_ENV || "desconocido",
    runtime: process.env.NEXT_RUNTIME || "desconocido",
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  }

  // Probar conectividad con OpenAI
  let openaiConnectivity = "no probado"
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "GET",
    })

    if (response.ok) {
      openaiConnectivity = "conectado"
    } else {
      const errorData = await response.json().catch(() => ({}))
      openaiConnectivity = `error: ${response.status} - ${JSON.stringify(errorData)}`
    }
  } catch (error) {
    openaiConnectivity = `excepción: ${error.message}`
  }

  return NextResponse.json({
    ...regionInfo,
    openaiConnectivity,
  })
}

