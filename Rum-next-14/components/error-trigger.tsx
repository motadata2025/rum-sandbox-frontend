"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    // This will trigger the error boundary
    throw new Error("This is a demonstration error triggered by the user!")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Error Boundary Demo
        </CardTitle>
        <CardDescription>
          Click the button below to trigger an unexpected error and see how our error boundary handles it gracefully.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setShouldError(true)} className="w-full">
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  )
}
