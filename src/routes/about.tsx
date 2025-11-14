import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">About</h1>
      <p className="mt-4 text-muted-foreground">Coming Soon</p>
    </div>
  )
}
