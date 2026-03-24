'use client'

import { useState } from 'react'
import { Product, VisitWithProducts } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { deleteVisit } from '@/actions/visits'
import { AddEditVisitDialog } from './add-edit-visit-dialog'
import { VisitCard } from './visit-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface VisitsTableProps {
  visits: VisitWithProducts[]
  products: Product[]
  visitDayId: string
}

export function VisitsTable({ visits, products, visitDayId }: VisitsTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingVisit, setEditingVisit] = useState<VisitWithProducts | undefined>()
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = async (visitId: string) => {
    if (!confirm('האם למחוק ביקור זה?')) return

    try {
      await deleteVisit(visitId, visitDayId)
    } catch (error) {
      alert('שגיאה במחיקת ביקור')
    }
  }

  const handleEdit = (visit: VisitWithProducts) => {
    setEditingVisit(visit)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">ביקורים</h2>
        <Button onClick={() => setShowAddDialog(true)}>הוסף ביקור</Button>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>אין ביקורים ליום זה</p>
          <p className="text-sm">לחץ על "הוסף ביקור" כדי להתחיל</p>
        </div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>כתובת</TableHead>
                  <TableHead>קומה</TableHead>
                  <TableHead>דירה</TableHead>
                  <TableHead>קוד</TableHead>
                  <TableHead>מוצרים</TableHead>
                  <TableHead>תשלום</TableHead>
                  <TableHead>שולם</TableHead>
                  <TableHead>סה"כ</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.name}</TableCell>
                    <TableCell>{visit.phone}</TableCell>
                    <TableCell>{visit.address}</TableCell>
                    <TableCell>{visit.floor}</TableCell>
                    <TableCell>{visit.apartment}</TableCell>
                    <TableCell>{visit.building_code}</TableCell>
                    <TableCell>{visit.products.map(p => p.name).join(', ')}</TableCell>
                    <TableCell>{visit.payment_method === 'cash' ? 'מזומן' : 'ביט'}</TableCell>
                    <TableCell>
                      <span className={visit.is_paid ? 'text-green-600' : 'text-red-600'}>
                        {visit.is_paid ? '✓' : '✗'}
                      </span>
                    </TableCell>
                    <TableCell>{formatPrice(visit.total_price)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(visit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(visit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-4">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onEdit={() => handleEdit(visit)}
                onDelete={() => handleDelete(visit.id)}
              />
            ))}
          </div>
        </>
      )}

      <AddEditVisitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        visitDayId={visitDayId}
        products={products}
      />

      <AddEditVisitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        visitDayId={visitDayId}
        products={products}
        visit={editingVisit}
      />
    </div>
  )
}
