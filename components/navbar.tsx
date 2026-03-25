'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { logout } from '@/actions/auth'
import { Button } from './ui/button'
import Link from 'next/link'

export function Navbar() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('שגיאה בהתנתקות')
    }
  }

  if (isLoading || !user) return null

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/days">
            <h1 className="text-xl font-bold">ניהול ביקורי בית</h1>
          </Link>
          <Link href="/days">
            <Button variant="ghost" size="sm">ימים</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">מוצרים</Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">שלום, {user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            התנתק
          </Button>
        </div>
      </div>
    </nav>
  )
}
