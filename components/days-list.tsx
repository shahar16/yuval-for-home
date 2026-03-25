'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { VisitDayWithCount } from '@/lib/types'
import { CreateDayDialog } from './create-day-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DaysListProps {
  days: VisitDayWithCount[]
}

export function DaysList({ days }: DaysListProps) {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ימי ביקור</h1>
        <Button onClick={() => setShowCreateDialog(true)}>יום חדש</Button>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>אין ימי ביקור מתוכננים</p>
          <p className="text-sm">לחץ על "יום חדש" כדי להתחיל</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תאריך</TableHead>
              <TableHead>אזור</TableHead>
              <TableHead>מספר ביקורים</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day.id}>
                <TableCell>{formatDate(day.date)}</TableCell>
                <TableCell>{day.area}</TableCell>
                <TableCell>{day.visit_count}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/days/${day.id}`)}
                  >
                    צפה
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateDayDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
