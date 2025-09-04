import { useRoutes, Link, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { routes } from './routes'
import { AuthForm } from './components/AuthForm'

export default function App() {
  const { user, loading, signOut } = useAuth()
  const element = useRoutes(routes)
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--muted)'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div>
      <nav className="panel" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/" className="ghost">Transactions</Link>
            <Link to="/insights" className="ghost">Insights</Link>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <small style={{ color: '#9ca3af' }}>{pathname}</small>
            <button className="ghost" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </nav>
      <div className="container">{element}</div>
    </div>
  )
}
