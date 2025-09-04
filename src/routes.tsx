import type { RouteObject } from 'react-router-dom'
import ExpensesPage from './features/expenses/ExpensesPage'
import InsightsPage from './features/insights/InsightsPage'

export const routes: RouteObject[] = [
    { path: '/', element: <ExpensesPage /> },
    { path: '/insights', element: <InsightsPage /> },
]
