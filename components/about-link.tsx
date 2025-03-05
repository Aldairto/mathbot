"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AboutLink() {
  return (
    <Button variant="link" asChild>
      <Link href="/about">Acerca de MathBot</Link>
    </Button>
  )
}

