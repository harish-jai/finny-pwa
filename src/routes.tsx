import type { RouteObject } from 'react-router-dom'
import ExpensesPage from './features/expenses/ExpensesPage'
import InsightsPage from './features/insights/InsightsPage'
import BudgetsPage from './features/budgets/BudgetsPage'
import CreditCardsPage from './features/credit-cards/CreditCardsPage'

export const routes: RouteObject[] = [
    { path: '/', element: <ExpensesPage /> },
    { path: '/insights', element: <InsightsPage /> },
    { path: '/budgets', element: <BudgetsPage /> },
    { path: '/credit-cards', element: <CreditCardsPage /> },
]
