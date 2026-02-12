# KageBookmarks

A real-time bookmark manager built with Next.js 14, Supabase, and Tailwind CSS.

## Use of this project

**KageBookmarks** is your personal, cloud-synced bookmark manager.

- **☁️ Access Anywhere**: Unlike browser bookmarks which are stuck on one device, this saves your links to a cloud database (Supabase). You can access them from your phone, work laptop, or any other device just by logging in.
- **🔒 Private & Secure**: It uses Google Authentication, so only _you_ can see your saved links.
- **⚡ Real-time**: If you add a bookmark on your phone, it instantly appears on your computer screen without refreshing (thanks to Supabase Realtime).
- **🎨 Clean UI**: A focused, distraction-free interface to manage your important links.

It's essentially a "Read Later" or "Favorites" list that travels with you everywhere. 🚀

## Features

- **Google OAuth Login**: Secure sign-in with Google.
- **Private Bookmarks**: Data is secured with Postgres RLS (Row Level Security).
- **Real-time Updates**: Bookmarks appear instantly across tabs/devices using Supabase Realtime.
- **Responsive Design**: Clean interface built with Tailwind CSS.

## Challenges & Solutions

During development, we encountered and solved several key technical challenges:

### 1. Real-time Deletion Not Syncing

- **Problem**: While `INSERT` events appeared instantly across tabs, `DELETE` events were ignored.
- **Cause**: By default, Supabase `DELETE` payloads only contain the `id` of the deleted row. Our code filtered events by `user_id` (e.g., `filter: 'user_id=eq.123'`). Since the delete payload didn't include `user_id`, the filter dropped the event.
- **Solution**: We ran `ALTER TABLE bookmarks REPLICA IDENTITY FULL;` in the SQL Editor. This forces Postgres to include the _entire_ row data (including `user_id`) in the delete payload, allowing the filter to work correctly.

### 2. Client-Side Hooks in Server Components

- **Problem**: We encountered an error: _Server Component "BookmarkList" is using `useEffect`._
- **Cause**: Next.js App Router components are Server Components by default. Hooks like `useState` and `useEffect` only work in Client Components.
- **Solution**: Added the `'use client'` directive to the top of `components/BookmarkList.tsx` and `components/AddBookmark.tsx` to explicitly mark them as client-side interactive boundaries.

### 3. Strict Row Level Security

- **Problem**: We needed to ensure that user data remained absolutely private, even if someone tried to access the database API directly.
- **Cause**: Standard database connections often have full access. We needed a way to restrict access based on the logged-in user's identity at the database layer itself.
- **Solution**: We implemented Postgres Row Level Security (RLS) policies. By adding `using (auth.uid() = user_id)` to our SQL table definition, we enforced that the database _physically refuses_ to return or modify any rows that don't belong to the authenticated user, providing an additional hard layer of security beyond just the application code.
