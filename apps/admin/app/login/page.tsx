import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  async function login(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error) {
      redirect('/login?error=' + encodeURIComponent(error.message))
    }
    redirect('/')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Admin sign in</h2>
        <form action={login}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          {error && <p className="login-error">{decodeURIComponent(error)}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
