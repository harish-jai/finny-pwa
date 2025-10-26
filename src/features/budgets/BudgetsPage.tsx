import { useState } from 'react'
import { useBudgets } from './useBudgets'
import { useCategories } from '../categories/useCategories'
import { useAuth } from '../../contexts/AuthContext'
import BudgetForm from './BudgetForm'
import type { Budget } from '../../lib/types'


export default function BudgetsPage() {
    const { data = [], create, update, remove } = useBudgets()
    const { data: categories = [] } = useCategories()
    const { user } = useAuth()
    const [editing, setEditing] = useState<Budget | null>(null)
    const [showForm, setShowForm] = useState(false)


    if (!user) return <div className="panel">Please sign in to manage budgets.</div>

    const handleCreate = (values: any) => {
        // Transform form values to match database schema
        const selectedCategory = categories.find(cat => cat.id === values.category_id)

        const budgetData = {
            user_id: user.id,
            category_id: values.budget_type === 'category' ? values.category_id : null,
            category: values.budget_type === 'category' ? selectedCategory?.name || '' : null,
            budget_type: values.budget_type,
            amount: values.amount,
            period: values.period,
            is_active: values.is_active
        }

        create.mutate(budgetData)
        setShowForm(false)
    }

    const handleUpdate = (values: any) => {
        if (editing) {
            const selectedCategory = categories.find(cat => cat.id === values.category_id)

            const patchData = {
                category_id: values.budget_type === 'category' ? values.category_id : null,
                category: values.budget_type === 'category' ? selectedCategory?.name || '' : null,
                budget_type: values.budget_type,
                amount: values.amount,
                period: values.period,
                is_active: values.is_active
            }

            update.mutate({ id: editing.id, patch: patchData })
            setEditing(null)
        }
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            remove.mutate(id)
        }
    }

    const activeBudgets = data.filter(b => b.is_active)
    const inactiveBudgets = data.filter(b => !b.is_active)

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>🎯 Budget Management</h2>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    + Add Budget
                </button>
            </div>

            {showForm && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Create New Budget</h3>
                    {create.error && (
                        <div style={{
                            color: 'var(--error)',
                            backgroundColor: 'var(--error-bg)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            Error creating budget: {String(create.error)}
                        </div>
                    )}
                    <BudgetForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {editing && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Edit Budget</h3>
                    <BudgetForm
                        initial={editing}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditing(null)}
                    />
                </div>
            )}

            {activeBudgets.length > 0 && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Active Budgets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeBudgets.map(budget => (
                            <div key={budget.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                backgroundColor: 'var(--panel)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{budget.category}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                        ${budget.amount.toFixed(2)} {budget.period}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setEditing(budget)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--accent)',
                                            border: '1px solid var(--accent)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget.id)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--error)',
                                            border: '1px solid var(--error)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {inactiveBudgets.length > 0 && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Inactive Budgets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {inactiveBudgets.map(budget => (
                            <div key={budget.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                backgroundColor: 'var(--panel)',
                                opacity: 0.6
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{budget.category}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                        ${budget.amount.toFixed(2)} {budget.period}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => update.mutate({ id: budget.id, patch: { is_active: true } })}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'var(--accent)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget.id)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--error)',
                                            border: '1px solid var(--error)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.length === 0 && (
                <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>No budgets set up yet</h3>
                    <p style={{ margin: '0 0 20px 0', color: 'var(--muted)' }}>
                        Create your first budget to start tracking your spending goals.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Create Your First Budget
                    </button>
                </div>
            )}
        </div>
    )
}
