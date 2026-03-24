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
  floor: string
  apartment: string
  building_code: string
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
  created_at: string
}

export interface VisitWithProducts extends Visit {
  products: Product[]
}

export interface VisitDayWithCount extends VisitDay {
  visit_count: number
}
