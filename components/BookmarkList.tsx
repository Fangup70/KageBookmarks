'use client'

import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Trash2, ExternalLink } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function BookmarkList({ user }: { user: User }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setBookmarks(data)
      setLoading(false)
    }

    fetchBookmarks()

    // Realtime subscription
    const channel = supabase
      .channel('realtime bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
             setBookmarks((prev) => prev.map(b => b.id === payload.new.id ? payload.new as Bookmark : b))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent clicks if any
    
    // Optimistic update
    const previousBookmarks = bookmarks
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    
    if (error) {
      console.error('Error deleting:', error)
      alert(`Failed to delete: ${error.message}`)
      // Revert optimistic update
      setBookmarks(previousBookmarks)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
            <ExternalLink className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-slate-900">No bookmarks yet</h3>
        <p className="text-slate-500">Add your first bookmark above to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10"
        >
          <div className="flex items-start gap-4">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                 <Image 
                    src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=64`} 
                    alt="Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                    unoptimized
                 />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 font-semibold text-slate-900 line-clamp-1" title={bookmark.title}>
                {bookmark.title}
                </h3>
                <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600 line-clamp-1"
                >
                {new URL(bookmark.url).hostname}
                <ExternalLink className="h-3 w-3" />
                </a>
             </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {new Date(bookmark.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={(e) => handleDelete(bookmark.id, e)}
              className="group/btn flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete bookmark"
            >
              <Trash2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
