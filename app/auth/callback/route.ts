import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/`)
    }

    // Successful authentication - redirect to onboarding
    return NextResponse.redirect(`${origin}/app/onboarding`)
  }

  // If no code, redirect to home page
  console.log('No code provided to auth callback')
  return NextResponse.redirect(`${origin}/`)
}
