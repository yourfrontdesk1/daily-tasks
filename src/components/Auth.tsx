import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    console.log('Auth result:', JSON.stringify(result, null, 2))

    setLoading(false)
    if (result.error) {
      setError(result.error.message)
    } else if (isSignUp && result.data?.user?.identities?.length === 0) {
      setError('Account already exists. Try signing in instead.')
    } else if (isSignUp && result.data?.user && !result.data.session) {
      setError('Check your email to confirm your account, or disable "Confirm email" in Supabase auth settings.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Daily Tasks</h1>
          <p className="text-gray-500 text-sm">Get things done, one day at a time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 placeholder:text-gray-600"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 placeholder:text-gray-600"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-white transition"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
