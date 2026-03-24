'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getDays() {
  const today = new Date().toISOString().split('T')[0]

  const { data: days, error } = await supabase
    .from('visit_days')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })

  if (error) throw error

  // Get visit counts for each day
  const daysWithCounts = await Promise.all(
    days.map(async (day) => {
      const { count } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_day_id', day.id)

      return { ...day, visit_count: count || 0 }
    })
  )

  return daysWithCounts
}

export async function getDay(id: string) {
  const { data, error } = await supabase
    .from('visit_days')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createDay(date: string, area: string) {
  const { data, error } = await supabase
    .from('visit_days')
    .insert({ date, area })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/days')
  return data
}

export async function deleteDay(id: string) {
  const { error } = await supabase
    .from('visit_days')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/days')
  return { success: true }
}
