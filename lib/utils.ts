import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTotalPrice(productCount: number): number {
  const basePrice = 500 // Visit + 1 product
  const extraProducts = Math.max(0, productCount - 1)
  return basePrice + (extraProducts * 100)
}

export function formatPrice(price: number): string {
  return `₪${price}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function validateIsraeliPhone(phone: string): boolean {
  // Strip spaces and dashes
  const cleaned = phone.replace(/[-\s]/g, '')
  // Regex: optional +972 or 0, then area code, then 7 digits
  const regex = /^(\+972|0)([23489]|5[0-9])\d{7}$/
  return regex.test(cleaned)
}
