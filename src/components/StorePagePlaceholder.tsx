import { useState } from 'react'
import { Store, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function StorePagePlaceholder() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    const email = 'sebastian@soleinnovations.com'
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  return (
    <main className="flex h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] items-center justify-center bg-background p-4 pb-16">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Store className="size-10 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            Store Coming Soon
          </h1>
          <p className="text-pretty text-muted-foreground leading-relaxed">
            We're working hard to bring you an amazing shopping experience. Our
            store will be ready soon!
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm font-medium text-foreground">
            Want to sell your products?
          </p>
          <Button
            onClick={handleCopyEmail}
            className={cn(
              'gap-2 transition-all duration-300',
              copied &&
                'bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700',
            )}
          >
            <Copy className="size-4" />
            {copied ? 'Copied!' : 'Copy Contact Email'}
          </Button>
        </div>
      </div>
    </main>
  )
}
