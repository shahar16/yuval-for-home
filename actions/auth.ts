'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function login(userId: string, userName: string) {
  const sessionData = JSON.stringify({ id: userId, name: userName })

  cookies().set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return { success: true }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME)
  return { success: true }
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return { user: null }
  }

  try {
    const user = JSON.parse(sessionCookie.value)
    return { user }
  } catch {
    return { user: null }
  }
}

export async function verifyAdminPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH

  if (!hash) {
    throw new Error('Admin password hash not configured')
  }

  const isValid = await bcrypt.compare(password, hash)
  return { success: isValid }
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}
