'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { z } from 'zod'

const bookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  url: z.string().url('Please enter a valid URL'),
})

export default function AddBookmark({ user }: { user: User }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    const result = bookmarkSchema.safeParse({ title, url })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from('bookmarks').insert({
        title,
        url,
        user_id: user.id,
      })
      if (error) throw error
      
      setTitle('')
      setUrl('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-10 rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
      <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Add New Bookmark</h2>
          <p className="text-sm text-slate-500">Save your favorite links for quick access.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="group flex-1 relative">
            <input
              type="text"
              placeholder=" "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="peer w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all placeholder:text-transparent focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              required
            />
            <label className="absolute left-4 top-3 -translate-y-6 scale-75 cursor-text bg-transparent text-xs font-semibold text-indigo-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-slate-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-indigo-500">
                Bookmark Title
            </label>
          </div>
          <div className="group flex-1 relative">
            <input
              type="url"
              placeholder=" "
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="peer w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all placeholder:text-transparent focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              required
            />
             <label className="absolute left-4 top-3 -translate-y-6 scale-75 cursor-text bg-transparent text-xs font-semibold text-indigo-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-slate-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-indigo-500">
                URL (https://...)
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex min-w-[100px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:bg-indigo-700 hover:shadow-indigo-500/50 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save
          </button>
        </div>
        {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <span className="font-bold">Error:</span> {error}
            </div>
        )}
      </form>
    </div>
  )
}
