import { useState } from 'react'
import { useExpenses } from './useExpenses'
import { useAuth } from '../../contexts/AuthContext'
import ExpenseForm from './ExpenseForm'
import ExpensesTable from './ExpensesTable'
import BudgetBanner from '../../components/BudgetBanner'
import type { Expense } from '../../lib/types'

function generateId() {
    // Generate a proper UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export default function ExpensesPage() {
    const { data, isLoading, error, create, update, remove } = useExpenses()
    const { user } = useAuth()
    const [editing, setEditing] = useState<Expense | null>(null)
    const [adding, setAdding] = useState(false)

    if (isLoading) return <div className="loading">Loading transactions…</div>
    if (error) return <div className="error">Error loading transactions: {String(error)}</div>
    if (!user) return <div className="panel">Please sign in to view expenses.</div>

    const rows = data ?? []

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>💰 Transactions</h2>
                <button onClick={() => { setAdding(true); setEditing(null) }} style={{ minHeight: '44px' }}>
                    ➕ Add Transaction
                </button>
            </div>

            <BudgetBanner />

            {adding && (
                <ExpenseForm
                    onSubmit={(v) => {
                        const tags = v.tags ? v.tags.split(',').map(s => s.trim()).filter(Boolean) : []
                        create.mutate({
                            id: generateId(),
                            user_id: user.id,
                            date: v.date,
                            amount: v.amount,
                            description: v.description,
                            category: v.category,
                            store: v.store ?? null,
                            payment_method: v.payment_method ?? null,
                            tags,
                            recurring: !!v.recurring,
                            gift: v.gift ?? '',
                            girlfriend: (v.girlfriendPct ?? 0) / 100,
                        })
                        setAdding(false)
                    }}
                    onCancel={() => setAdding(false)}
                />
            )}

            {editing && (
                <ExpenseForm
                    initial={editing}
                    onSubmit={(v) => {
                        const tags = v.tags ? v.tags.split(',').map(s => s.trim()).filter(Boolean) : []
                        update.mutate({
                            id: editing.id,
                            patch: {
                                date: v.date,
                                amount: v.amount,
                                description: v.description,
                                category: v.category,
                                store: v.store ?? null,
                                payment_method: v.payment_method ?? null,
                                tags,
                                recurring: !!v.recurring,
                                gift: v.gift ?? '',
                                girlfriend: (v.girlfriendPct ?? 0) / 100,
                            }
                        })
                        setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                />
            )}

            <ExpensesTable
                rows={rows}
                onEdit={setEditing}
                onDelete={(e) => remove.mutate(e.id)}
            />
        </div>
    )
}
