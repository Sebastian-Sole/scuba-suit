import { createFileRoute } from '@tanstack/react-router'
import { StorePagePlaceholder } from '@/components/StorePagePlaceholder'
// import { StorePageFull } from '@/components/StorePageFull'

interface StoreSearch {
  category?: string
  priceRange?: string
  brand?: string
}

export const Route = createFileRoute('/store')({
  component: StorePage,
  validateSearch: (search: Record<string, unknown>): StoreSearch => {
    return {
      category: typeof search.category === 'string' ? search.category : undefined,
      priceRange: typeof search.priceRange === 'string' ? search.priceRange : undefined,
      brand: typeof search.brand === 'string' ? search.brand : undefined,
    }
  },
})

function StorePage() {
  // const { category, priceRange, brand } = Route.useSearch()
  // return <StorePageFull category={category} priceRange={priceRange} brand={brand} />
  return <StorePagePlaceholder />
}
