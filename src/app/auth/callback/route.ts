import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('[auth/callback] code present:', !!code)

  if (code) {
    const response = NextResponse.redirect(`${origin}/dashboard`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get('cookie') || ''
            return cookieHeader.split(';').filter(Boolean).map((c) => {
              const [name, ...rest] = c.trim().split('=')
              return { name, value: rest.join('=') }
            })
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchangeCode error:', error?.message || 'none')

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[auth/callback] user:', user?.email, user?.id)

      if (user) {
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
        console.log('[auth/callback] service key present:', hasServiceKey)

        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Check if the user already has a profile
        const { data: profile, error: profileErr } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        console.log('[auth/callback] profile found:', !!profile, 'error:', profileErr?.message || 'none')

        if (profile) {
          return response
        }

        // 2. Check if the user's email is in the allowed list
        const { data: invite, error: inviteErr } = await adminClient
          .from('allowed_emails')
          .select('*')
          .eq('email', user.email)
          .single()

        console.log('[auth/callback] invite found:', !!invite, 'error:', inviteErr?.message || 'none')

        if (invite) {
          const { error: insertErr } = await adminClient.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            role: invite.role,
            avatar_url: user.user_metadata?.avatar_url || '',
          })

          console.log('[auth/callback] profile insert error:', insertErr?.message || 'none')

          await adminClient.from('allowed_emails').delete().eq('id', invite.id)

          return response
        }

        // 3. Not authorized — sign out
        console.log('[auth/callback] REJECTED - no profile and no invite for', user.email)
        await supabase.auth.signOut()
      }

      return NextResponse.redirect(`${origin}/login?error=Unauthorized`)
    }

    console.error('Auth callback error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=AuthError`)
}
