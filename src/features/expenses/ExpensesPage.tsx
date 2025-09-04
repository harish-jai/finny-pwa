import { useState } from 'react'
import { useExpenses } from './useExpenses'
import { useAuth } from '../../contexts/AuthContext'
import ExpenseForm from './ExpenseForm'
import ExpensesTable from './ExpensesTable'
import type { Expense } from '../../lib/types'

function ulid() {
    // tiny ULID-ish; use a proper lib if you like
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function ExpensesPage() {
    const { data, isLoading, error, create, update, remove } = useExpenses()
    const { user } = useAuth()
    const [editing, setEditing] = useState<Expense | null>(null)
    const [adding, setAdding] = useState(false)

    if (isLoading) return <div className="panel">Loading…</div>
    if (error) return <div className="panel" style={{ color: 'var(--danger)' }}>{String(error)}</div>
    if (!user) return <div className="panel">Please sign in to view expenses.</div>

    const rows = data ?? []

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Transactions</h2>
                <button onClick={() => { setAdding(true); setEditing(null) }}>Add</button>
            </div>

            {adding && (
                <ExpenseForm
                    onSubmit={(v) => {
                        const tags = v.tags ? v.tags.split(',').map(s => s.trim()).filter(Boolean) : []
                        create.mutate({
                            id: ulid(),
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
