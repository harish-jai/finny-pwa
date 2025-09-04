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
      <nav className="panel" style={{ position: 'sticky', top: 0, zIndex: 10, marginBottom: 0 }}>
        <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="nav-mobile">
            <Link to="/" className="ghost" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: '44px' }}>
              💰 Transactions
            </Link>
            <Link to="/insights" className="ghost" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: '44px' }}>
              📊 Insights
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <small style={{ color: 'var(--muted)', fontSize: '12px' }}>{pathname}</small>
            <button className="ghost" onClick={signOut} style={{ minHeight: '44px' }}>Sign Out</button>
          </div>
        </div>
      </nav>
      <div className="container">{element}</div>
    </div>
  )
}
