'use client'

import { useState } from 'react'
import { Product } from '@/lib/types'
import { createProduct, deleteProduct } from '@/actions/products'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

interface ProductsManagerProps {
  products: Product[]
}

export function ProductsManager({ products }: ProductsManagerProps) {
  const [newProductName, setNewProductName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await createProduct(newProductName)
      setNewProductName('')
    } catch (err: any) {
      setError(err.message || 'שגיאה ביצירת מוצר')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`למחוק את "${productName}"?`)) return

    try {
      await deleteProduct(productId)
    } catch (err: any) {
      alert(err.message || 'שגיאה במחיקת מוצר')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">הוסף מוצר חדש</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="שם המוצר"
              required
            />
          </div>
          <Button type="submit" disabled={!newProductName || isLoading}>
            {isLoading ? 'יוצר...' : 'הוסף'}
          </Button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">מוצרים קיימים</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">אין מוצרים במערכת</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם המוצר</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
