import { useRoutes, Link, useLocation } from 'react-router-dom'
import { routes } from './routes'

export default function App() {
  const element = useRoutes(routes)
  const { pathname } = useLocation()
  return (
    <div>
      <nav className="panel" style={{ position:'sticky', top:0, zIndex:10 }}>
        <div className="container" style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:12 }}>
            <Link to="/" className="ghost">Transactions</Link>
            <Link to="/insights" className="ghost">Insights</Link>
          </div>
          <small style={{ color:'#9ca3af' }}>{pathname}</small>
        </div>
      </nav>
      <div className="container">{element}</div>
    </div>
  )
}
