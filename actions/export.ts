'use server'

import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { getDay } from './days'

interface VisitProductQuery {
  products: {
    name: string
  } | null
}

export async function exportVisitsToExcel(visitDayId: string) {
  // Get day info
  const day = await getDay(visitDayId)

  // Get visits with products
  const { data: visits, error } = await supabase
    .from('visits')
    .select(`
      *,
      visit_products (
        products (
          name
        )
      )
    `)
    .eq('visit_day_id', visitDayId)
    .order('created_at', { ascending: true })

  if (error) throw error

  if (visits.length === 0) {
    throw new Error('אין ביקורים ליום זה')
  }

  // Map to Excel rows
  const rows = visits.map((visit, index) => {
    const products = (visit.visit_products as VisitProductQuery[])
      .map((vp) => vp.products?.name)
      .filter(Boolean)
      .join(', ')

    return {
      'מספר': index + 1,
      'שם': visit.name,
      'טלפון': visit.phone,
      'כתובת': visit.address,
      'קומה': visit.floor,
      'דירה': visit.apartment,
      'קוד': visit.building_code,
      'מוצרים': products,
      'תשלום': visit.payment_method === 'cash' ? 'מזומן' : 'ביט',
      'שולם': visit.is_paid ? 'כן' : 'לא',
      'סה"כ': `₪${visit.total_price}`,
    }
  })

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ביקורים')

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // מספר
    { wch: 15 }, // שם
    { wch: 12 }, // טלפון
    { wch: 25 }, // כתובת
    { wch: 6 },  // קומה
    { wch: 6 },  // דירה
    { wch: 10 }, // קוד
    { wch: 30 }, // מוצרים
    { wch: 8 },  // תשלום
    { wch: 6 },  // שולם
    { wch: 10 }, // סה"כ
  ]

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  // Generate filename
  const filename = `ביקורים-${day.area}-${day.date}.xlsx`

  return {
    buffer: Array.from(buffer),
    filename,
  }
}
