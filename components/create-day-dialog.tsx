'use client'

import { useState } from 'react'
import { createDay } from '@/actions/days'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface CreateDayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDayDialog({ open, onOpenChange }: CreateDayDialogProps) {
  const [date, setDate] = useState('')
  const [area, setArea] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await createDay(date, area)
      onOpenChange(false)
      setDate('')
      setArea('')
    } catch (err: any) {
      setError(err.message || 'שגיאה ביצירת יום')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת יום ביקור חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">תאריך</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">אזור</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="למשל: תל אביב"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'יוצר...' : 'צור יום'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
