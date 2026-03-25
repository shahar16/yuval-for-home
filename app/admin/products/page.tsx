'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/actions/products'
import { Product } from '@/lib/types'
import { ProductsManager } from '@/components/products-manager'
import { AdminPasswordPrompt } from '@/components/admin-password-prompt'

export default function ProductsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  const handlePasswordSuccess = async () => {
    setIsAuthorized(true)
    const data = await getProducts()
    setProducts(data)
  }

  const handlePasswordCancel = () => {
    router.push('/days')
  }

  if (!isAuthorized) {
    return (
      <div dir="rtl">
        <AdminPasswordPrompt
          open={showPasswordPrompt}
          onOpenChange={(open) => {
            setShowPasswordPrompt(open)
            if (!open) handlePasswordCancel()
          }}
          onSuccess={handlePasswordSuccess}
          title="ניהול מוצרים"
          description="דרושה סיסמת מנהל לגישה לעמוד זה"
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">ניהול מוצרים</h1>
      <ProductsManager products={products} />
    </div>
  )
}
