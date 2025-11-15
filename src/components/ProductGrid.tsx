import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/products'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2">Scuba Gear</h2>
        <p className="text-muted-foreground">{products.length} products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
