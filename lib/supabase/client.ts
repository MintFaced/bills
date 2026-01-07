import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...rest] = cookie.split('=')
              return { name, value: rest.join('=') }
            })
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''} ${options?.domain ? `domain=${options.domain};` : ''} ${options?.sameSite ? `samesite=${options.sameSite};` : 'samesite=lax;'}`
          })
        },
      },
    }
  )
}
