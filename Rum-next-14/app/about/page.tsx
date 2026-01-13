import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-balance">About Our Platform</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
          We're passionate about crafting accessible, pixel-perfect user interfaces that blend thoughtful design with
          robust engineering. Our platform represents the intersection of design and development.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Currently, we're focused on building tools that help developers create products faster. We specialize in
              modern web technologies, ensuring our platform meets web accessibility standards and best practices to
              deliver an inclusive user experience.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Approach</h2>
            <p className="text-muted-foreground leading-relaxed">
              In the past, we've had the opportunity to develop software across a variety of settings — from{" "}
              <span className="text-foreground font-medium">advertising agencies</span> and{" "}
              <span className="text-foreground font-medium">large corporations</span> to{" "}
              <span className="text-foreground font-medium">start-ups</span> and{" "}
              <span className="text-foreground font-medium">small digital product studios</span>.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Excellence</CardTitle>
              <CardDescription>Built with modern technologies and best practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Next.js", "Tailwind CSS"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                We use cutting-edge technologies to ensure performance, maintainability, and developer experience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Experience</CardTitle>
              <CardDescription>Designed with accessibility and usability in mind</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every component is built to be accessible, responsive, and performant across all devices and screen
                sizes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">Our Journey</h2>
        <div className="space-y-6">
          <div className="border-l-2 border-primary pl-6 pb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-muted-foreground">2024 — PRESENT</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Senior Frontend Engineer, Modern Web Platform</h3>
            <p className="text-muted-foreground text-sm">
              Build and maintain critical components used to construct our platform's frontend, across the whole
              product. Work closely with cross-functional teams, including developers, designers, and product managers,
              to implement and advocate for best practices in web accessibility.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-semibold">Ready to Experience Our Platform?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Try our contact form to see how we handle user interactions and error states with grace and clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
