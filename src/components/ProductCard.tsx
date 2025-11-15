import type { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group cursor-pointer flex flex-col items-center">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted mb-4 w-[60%]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1 text-center">
        <h3 className="font-medium text-foreground">{product.name}</h3>
        <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
      </div>
    </div>
  )
}
