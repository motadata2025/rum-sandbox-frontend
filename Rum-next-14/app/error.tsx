"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
          <CardDescription>
            An unexpected error occurred while processing your request. This has been logged and we're working to fix
            it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details */}
          <div className="bg-muted p-3 rounded-md text-left">
            <p className="text-xs text-muted-foreground mb-1">Error Details:</p>
            <code className="text-xs text-destructive break-all">{error.message || "Unknown error occurred"}</code>
            {error.digest && <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              If this problem persists, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact our support team
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
