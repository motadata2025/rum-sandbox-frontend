import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 mb-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            The Modern Web Framework
            <span className="text-primary"> for Developers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Build high-quality web applications with the power of React components, modern design patterns, and robust
            error handling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <code className="bg-muted px-2 py-1 rounded">npx create-modern-app@latest</code>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Modern Design</CardTitle>
            <CardDescription>Clean, professional interfaces with dark theme support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Built with modern design principles and accessibility in mind.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Handling</CardTitle>
            <CardDescription>Robust error boundaries and graceful failure recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive error handling to ensure great user experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-page Support</CardTitle>
            <CardDescription>Full routing with navigation and page transitions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete multi-page application structure with modern routing.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <p className="text-muted-foreground">Try our contact form to see error handling in action.</p>
        <Button asChild>
          <Link href="/contact">Try Contact Form</Link>
        </Button>
      </div>
    </div>
  )
}
