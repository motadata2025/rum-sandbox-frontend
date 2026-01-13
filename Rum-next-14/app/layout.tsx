import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import "./globals.css"
import MotadataInit from "@/components/motadata-provider"

export const metadata: Metadata = {
  title: "Modern Web App",
  description: "A full-fledged multipage React application with error handling",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <MotadataInit/>
          <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
              <Navigation />
              <main className="min-h-screen">{children}</main>
            </Suspense>
          </ErrorBoundary>

        <Analytics />
      </body>
    </html>

  )
}