import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Force delete cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  allCookies.forEach((cookie: { name: string }) => {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name)
    }
  })

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
