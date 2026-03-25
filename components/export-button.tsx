'use client'

import { useState } from 'react'
import { exportVisitsToExcel } from '@/actions/export'
import { AdminPasswordPrompt } from './admin-password-prompt'
import { Button } from './ui/button'

interface ExportButtonProps {
  visitDayId: string
}

export function ExportButton({ visitDayId }: ExportButtonProps) {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const { buffer, filename } = await exportVisitsToExcel(visitDayId)

      // Create blob and download
      const blob = new Blob([new Uint8Array(buffer as number[])], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || 'שגיאה בייצוא לאקסל')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPasswordPrompt(true)}
        disabled={isExporting}
      >
        {isExporting ? 'מייצא...' : 'ייצא לאקסל'}
      </Button>

      <AdminPasswordPrompt
        open={showPasswordPrompt}
        onOpenChange={setShowPasswordPrompt}
        onSuccess={handleExport}
        title="ייצוא לאקסל"
        description="נדרשת סיסמת מנהל לייצוא נתונים"
      />
    </>
  )
}
