import { getUsers } from '@/actions/auth'
import { LoginForm } from '@/components/login-form'

export default async function LoginPage() {
  const users = await getUsers()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">ניהול ביקורי בית</h1>
          <p className="text-gray-600 mt-2">התחבר כדי להמשיך</p>
        </div>

        <LoginForm users={users} />
      </div>
    </div>
  )
}
