import { Waves } from 'lucide-react'
import { categories, priceRanges, brands } from '@/lib/products'
import { cn } from '@/lib/utils'

interface StoreSidebarProps {
  selectedCategory: string | null
  selectedPriceRange: string | null
  selectedBrand: string | null
  onCategoryChange: (category: string | null) => void
  onPriceRangeChange: (range: string | null) => void
  onBrandChange: (brand: string | null) => void
}

export function StoreSidebar({
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
  onCategoryChange,
  onPriceRangeChange,
  onBrandChange,
}: StoreSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-sidebar p-6 overflow-y-auto border-r border-sidebar-border h-full">
      <div className="mb-8">
        <nav className="space-y-8">
          <div>
            <h2 className="text-sm font-medium text-sidebar-foreground mb-3">
              Categories
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onCategoryChange(null)}
                  className={cn(
                    'text-sm text-left w-full transition-colors',
                    selectedCategory === null
                      ? 'text-sidebar-foreground font-medium'
                      : 'text-muted-foreground hover:text-sidebar-foreground',
                  )}
                >
                  All Categories
                </button>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                      'text-sm text-left w-full transition-colors',
                      selectedCategory === category
                        ? 'text-sidebar-foreground font-medium'
                        : 'text-muted-foreground hover:text-sidebar-foreground',
                    )}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-sidebar-foreground mb-3">
              Price
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onPriceRangeChange(null)}
                  className={cn(
                    'text-sm text-left w-full transition-colors',
                    selectedPriceRange === null
                      ? 'text-sidebar-foreground font-medium'
                      : 'text-muted-foreground hover:text-sidebar-foreground',
                  )}
                >
                  All Prices
                </button>
              </li>
              {priceRanges.map((range) => (
                <li key={range.name}>
                  <button
                    onClick={() => onPriceRangeChange(range.name)}
                    className={cn(
                      'text-sm text-left w-full transition-colors',
                      selectedPriceRange === range.name
                        ? 'text-sidebar-foreground font-medium'
                        : 'text-muted-foreground hover:text-sidebar-foreground',
                    )}
                  >
                    {range.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-sidebar-foreground mb-3">
              Brands
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onBrandChange(null)}
                  className={cn(
                    'text-sm text-left w-full transition-colors',
                    selectedBrand === null
                      ? 'text-sidebar-foreground font-medium'
                      : 'text-muted-foreground hover:text-sidebar-foreground',
                  )}
                >
                  All Brands
                </button>
              </li>
              {brands.map((brand) => (
                <li key={brand}>
                  <button
                    onClick={() => onBrandChange(brand)}
                    className={cn(
                      'text-sm text-left w-full transition-colors',
                      selectedBrand === brand
                        ? 'text-sidebar-foreground font-medium'
                        : 'text-muted-foreground hover:text-sidebar-foreground',
                    )}
                  >
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}
