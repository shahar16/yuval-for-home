'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'
import { calculateTotalPrice } from '@/lib/utils'

export interface CreateVisitInput {
  visit_day_id: string
  name: string
  phone: string
  address: string
  private_house: boolean
  floor?: string
  apartment?: string
  building_code?: string
  payment_method: 'cash' | 'bit'
  is_paid: boolean
  product_quantities: Record<string, number> // { product_id: quantity }
}

export async function getVisits(visitDayId: string) {
  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .eq('visit_day_id', visitDayId)
    .order('created_at', { ascending: true })

  if (visitsError) throw visitsError

  // Get products for each visit
  const visitsWithProducts = await Promise.all(
    visits.map(async (visit) => {
      const { data: visitProducts } = await supabase
        .from('visit_products')
        .select('product_id, quantity, products(id, name)')
        .eq('visit_id', visit.id)

      const products = visitProducts?.map(vp => ({ ...vp.products, quantity: vp.quantity })) || []
      return { ...visit, products }
    })
  )

  return visitsWithProducts
}

export async function createVisit(input: CreateVisitInput) {
  const session = await getSession()
  if (!session.user) {
    throw new Error('Not authenticated')
  }

  const totalProducts = Object.values(input.product_quantities).reduce((sum, qty) => sum + qty, 0)
  const total_price = calculateTotalPrice(totalProducts)

  // Insert visit
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .insert({
      visit_day_id: input.visit_day_id,
      name: input.name,
      phone: input.phone,
      address: input.address,
      private_house: input.private_house,
      floor: input.floor || null,
      apartment: input.apartment || null,
      building_code: input.building_code || null,
      payment_method: input.payment_method,
      is_paid: input.is_paid,
      total_price,
      created_by: session.user.id,
    })
    .select()
    .single()

  if (visitError) throw visitError

  // Insert visit products with quantities
  const visitProducts = Object.entries(input.product_quantities).map(([product_id, quantity]) => ({
    visit_id: visit.id,
    product_id,
    quantity,
  }))

  const { error: productsError } = await supabase
    .from('visit_products')
    .insert(visitProducts)

  if (productsError) throw productsError

  revalidatePath(`/days/${input.visit_day_id}`)
  return visit
}

export async function updateVisit(visitId: string, input: CreateVisitInput) {
  const session = await getSession()
  if (!session.user) {
    throw new Error('Not authenticated')
  }

  const totalProducts = Object.values(input.product_quantities).reduce((sum, qty) => sum + qty, 0)
  const total_price = calculateTotalPrice(totalProducts)

  // Update visit
  const { error: visitError } = await supabase
    .from('visits')
    .update({
      name: input.name,
      phone: input.phone,
      address: input.address,
      private_house: input.private_house,
      floor: input.floor || null,
      apartment: input.apartment || null,
      building_code: input.building_code || null,
      payment_method: input.payment_method,
      is_paid: input.is_paid,
      total_price,
    })
    .eq('id', visitId)

  if (visitError) throw visitError

  // Delete existing products
  await supabase
    .from('visit_products')
    .delete()
    .eq('visit_id', visitId)

  // Insert new products with quantities
  const visitProducts = Object.entries(input.product_quantities).map(([product_id, quantity]) => ({
    visit_id: visitId,
    product_id,
    quantity,
  }))

  const { error: productsError } = await supabase
    .from('visit_products')
    .insert(visitProducts)

  if (productsError) throw productsError

  revalidatePath(`/days/${input.visit_day_id}`)
  return { success: true }
}

export async function deleteVisit(visitId: string, visitDayId: string) {
  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('id', visitId)

  if (error) throw error

  revalidatePath(`/days/${visitDayId}`)
  return { success: true }
}
