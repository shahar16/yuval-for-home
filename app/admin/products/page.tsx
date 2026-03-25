'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/actions/products'
import { Product } from '@/lib/types'
import { ProductsManager } from '@/components/products-manager'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">ניהול מוצרים</h1>
      <ProductsManager products={products} />
    </div>
  )
}
