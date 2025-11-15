import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { StoreSidebar } from '@/components/StoreSidebar'
import { ProductGrid } from '@/components/ProductGrid'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { products, priceRanges } from '@/lib/products'

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
  const { category, priceRange, brand } = Route.useSearch()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(priceRange || null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(brand || null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Update state when URL search params change
  useEffect(() => {
    if (category) setSelectedCategory(category)
    if (priceRange) setSelectedPriceRange(priceRange)
    if (brand) setSelectedBrand(brand)
  }, [category, priceRange, brand])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by category
      if (selectedCategory && product.category !== selectedCategory) {
        return false
      }

      // Filter by price range
      if (selectedPriceRange) {
        const range = priceRanges.find((r) => r.name === selectedPriceRange)
        if (range && (product.price < range.min || product.price >= range.max)) {
          return false
        }
      }

      // Filter by brand
      if (selectedBrand && product.brand !== selectedBrand) {
        return false
      }

      return true
    })
  }, [selectedCategory, selectedPriceRange, selectedBrand])

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Toggle */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-20 left-4 z-40">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <StoreSidebar
            selectedCategory={selectedCategory}
            selectedPriceRange={selectedPriceRange}
            selectedBrand={selectedBrand}
            onCategoryChange={setSelectedCategory}
            onPriceRangeChange={setSelectedPriceRange}
            onBrandChange={setSelectedBrand}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen">
        <StoreSidebar
          selectedCategory={selectedCategory}
          selectedPriceRange={selectedPriceRange}
          selectedBrand={selectedBrand}
          onCategoryChange={setSelectedCategory}
          onPriceRangeChange={setSelectedPriceRange}
          onBrandChange={setSelectedBrand}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12">
        <ProductGrid products={filteredProducts} />
      </main>
    </div>
  )
}
