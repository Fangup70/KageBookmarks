'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Bookmark } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter()
import { signOutAction } from '@/app/auth/actions'

export default function Navbar({ user }: { user: User | null }) {
  // const router = useRouter() // No longer needed for sign out navigation
  // const supabase = createClient() // No longer needed for sign out

  const handleSignOut = async () => {
    await signOutAction()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
             <Bookmark className="h-5 w-5 fill-current" />
           </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            KageBookmarks
          </span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-semibold text-slate-700">
                    {user.user_metadata?.full_name || 'User'}
                </span>
                <span className="text-xs text-slate-500">
                    {user.email}
                </span>
            </div>
            <button
              onClick={handleSignOut}
              className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
