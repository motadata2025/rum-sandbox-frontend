import { ErrorTrigger } from "@/components/error-trigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-balance">Error Handling Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          This page demonstrates various error scenarios and how our application handles them gracefully with proper
          user feedback.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Error Boundary Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">React Error Boundary</h2>
          <ErrorTrigger />
        </div>

        {/* Form Errors Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Error Handling</h2>
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Errors</CardTitle>
              <CardDescription>
                Our contact form demonstrates validation errors, network failures, and recovery mechanisms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/contact">Try Contact Form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 404 Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">404 Error Page</h2>
          <Card>
            <CardHeader>
              <CardTitle>Page Not Found</CardTitle>
              <CardDescription>See how we handle missing pages with helpful navigation options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/non-existent-page">Visit 404 Page</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Navigation</h2>
          <Card>
            <CardHeader>
              <CardTitle>Explore the App</CardTitle>
              <CardDescription>Navigate through different pages to see the complete experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">Homepage</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/about">About Page</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
