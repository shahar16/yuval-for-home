'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LoginFormProps {
  users: User[]
}

export function LoginForm({ users }: LoginFormProps) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId) return

    setIsLoading(true)

    const user = users.find(u => u.id === selectedUserId)
    if (!user) return

    await login(user.id, user.name)
    router.push('/days')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium">בחר שם</label>
        <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value || '')}>
          <SelectTrigger>
            <SelectValue placeholder="בחר עובד" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={!selectedUserId || isLoading}>
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </Button>
    </form>
  )
}
