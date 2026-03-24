'use client'

import { useState } from 'react'
import { verifyAdminPassword } from '@/actions/auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface AdminPasswordPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  title?: string
  description?: string
}

export function AdminPasswordPrompt({
  open,
  onOpenChange,
  onSuccess,
  title = 'הזן סיסמת מנהל',
  description = 'פעולה זו דורשת אישור מנהל'
}: AdminPasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await verifyAdminPassword(password)

      if (result.success) {
        onSuccess()
        onOpenChange(false)
        setPassword('')
      } else {
        setError('סיסמה שגויה')
      }
    } catch (err) {
      setError('שגיאה בבדיקת סיסמה')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הזן סיסמת מנהל"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={!password || isLoading}>
              {isLoading ? 'מאמת...' : 'אישור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
