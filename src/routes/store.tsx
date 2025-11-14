import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store')({
  component: StorePage,
})

function StorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Store</h1>
      <p className="mt-4 text-muted-foreground">Coming Soon</p>
    </div>
  )
}
