export interface User {
  id: string
  name: string
  created_at: string
}

export interface VisitDay {
  id: string
  date: string
  area: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  created_at: string
}

export interface Visit {
  id: string
  visit_day_id: string
  name: string
  phone: string
  address: string
  private_house: boolean
  floor: string | null
  apartment: string | null
  building_code: string | null
  payment_method: 'cash' | 'bit'
  is_paid: boolean
  total_price: number
  created_by: string
  created_at: string
}

export interface VisitProduct {
  id: string
  visit_id: string
  product_id: string
  quantity: number
  created_at: string
}

export interface VisitWithProducts extends Visit {
  products: (Product & { quantity: number })[]
}

export interface VisitDayWithCount extends VisitDay {
  visit_count: number
}
