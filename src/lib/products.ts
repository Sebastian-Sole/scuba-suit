export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  brand: string
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Pro Dive Mask',
    price: 129.99,
    image: 'https://placehold.co/600x600/0891b2/white?text=Dive+Mask',
    category: 'Diving Masks',
    brand: 'Aqua Lung',
  },
  {
    id: 2,
    name: 'Elite Regulator',
    price: 449.99,
    image: 'https://placehold.co/600x600/0e7490/white?text=Regulator',
    category: 'Regulators',
    brand: 'Scubapro',
  },
  {
    id: 3,
    name: 'Tech BCD',
    price: 699.99,
    image: 'https://placehold.co/600x600/155e75/white?text=BCD',
    category: 'BCDs',
    brand: 'Mares',
  },
  {
    id: 4,
    name: 'Thermal Wetsuit',
    price: 299.99,
    image: 'https://placehold.co/600x600/0c4a6e/white?text=Wetsuit',
    category: 'Wetsuits',
    brand: 'Cressi',
  },
  {
    id: 5,
    name: 'Carbon Fiber Fins',
    price: 189.99,
    image: 'https://placehold.co/600x600/0891b2/white?text=Fins',
    category: 'Fins',
    brand: 'Scubapro',
  },
  {
    id: 6,
    name: 'Smart Dive Computer',
    price: 549.99,
    image: 'https://placehold.co/600x600/0e7490/white?text=Computer',
    category: 'Dive Computers',
    brand: 'Aqua Lung',
  },
  {
    id: 7,
    name: 'Premium Snorkel',
    price: 59.99,
    image: 'https://placehold.co/600x600/155e75/white?text=Snorkel',
    category: 'Accessories',
    brand: 'Mares',
  },
  {
    id: 8,
    name: 'Dive Light Pro',
    price: 179.99,
    image: 'https://placehold.co/600x600/0c4a6e/white?text=Light',
    category: 'Accessories',
    brand: 'Cressi',
  },
]

export const categories = [
  'Diving Masks',
  'Regulators',
  'BCDs',
  'Wetsuits',
  'Fins',
  'Dive Computers',
  'Accessories',
]

export const priceRanges = [
  { name: 'Under $100', min: 0, max: 100 },
  { name: '$100 - $300', min: 100, max: 300 },
  { name: '$300 - $600', min: 300, max: 600 },
  { name: 'Over $600', min: 600, max: Infinity },
]

export const brands = ['Aqua Lung', 'Scubapro', 'Mares', 'Cressi']
