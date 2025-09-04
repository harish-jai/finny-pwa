import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function SignInBox() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    return (
        <div className="panel">
            <h3>Sign in</h3>
            <input
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <button onClick={async () => {
                await supabase.auth.signInWithOtp({ email })
                setSent(true)
            }}>
                Send magic link
            </button>
            {sent && <div style={{ color: 'var(--muted)' }}>Check your email.</div>}
        </div>
    )
}
