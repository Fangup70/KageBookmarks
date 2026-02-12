import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AddBookmark from '@/components/AddBookmark'
import BookmarkList from '@/components/BookmarkList'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Bookmarks</h1>
        <AddBookmark user={user} />
        <BookmarkList user={user} />
      </main>
    </div>
  )
}
