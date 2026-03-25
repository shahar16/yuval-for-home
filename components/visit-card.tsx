'use client'

import { VisitWithProducts } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface VisitCardProps {
  visit: VisitWithProducts
  onEdit: () => void
  onDelete: () => void
}

export function VisitCard({ visit, onEdit, onDelete }: VisitCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{visit.name}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        {visit.private_house
          ? `${visit.address} (בית פרטי)`
          : `${visit.address}, קומה ${visit.floor}, דירה ${visit.apartment}`}
        {visit.building_code && ` | קוד: ${visit.building_code}`}
      </p>

      <p className="text-sm italic text-gray-500">
        {visit.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
      </p>

      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2 text-sm">
          <span>{visit.payment_method === 'cash' ? 'מזומן' : 'ביט'}</span>
          <span className={visit.is_paid ? 'text-green-600' : 'text-red-600'}>
            {visit.is_paid ? '✓ שולם' : '✗ לא שולם'}
          </span>
        </div>
        <span className="font-bold text-lg">{formatPrice(visit.total_price)}</span>
      </div>
    </div>
  )
}
