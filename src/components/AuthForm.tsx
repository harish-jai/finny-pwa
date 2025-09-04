import { useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthMode = 'signin' | 'signup'

export function AuthForm() {
    const [mode, setMode] = useState<AuthMode>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error

                setMessage('Account created successfully! You can now sign in.')
                // Switch to sign in mode after successful sign up
                setMode('signin')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                setMessage('Signed in successfully!')
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="panel" style={{ maxWidth: '400px', margin: '40px auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>

            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                />

                <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
                    {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
            </form>

            {message && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: message.includes('error') ? 'var(--danger)' : 'var(--accent)',
                    color: message.includes('error') ? 'white' : '#041008',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin')
                        setMessage('') // Clear any previous messages
                    }}
                    disabled={loading}
                >
                    {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                </button>
            </div>
        </div>
    )
}
