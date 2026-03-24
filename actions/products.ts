'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createProduct(name: string) {
  const { data, error } = await supabase
    .from('products')
    .insert({ name })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/admin/products')
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') { // Foreign key violation
      throw new Error('לא ניתן למחוק מוצר המשויך לביקורים קיימים')
    }
    throw error
  }

  revalidatePath('/admin/products')
  return { success: true }
}
