import { useState, useMemo } from 'react'
import { useCreditCards } from './useCreditCards'
import { useExpenses } from '../expenses/useExpenses'
import { useAuth } from '../../contexts/AuthContext'
import CreditCardForm from './CreditCardForm'
import PaymentForm from './payments/PaymentForm'
import { calculateUtilization, type CreditCardUtilization } from '../../lib/creditCardUtils'
import type { CreditCard } from '../../lib/types'

export default function CreditCardsPage() {
    const { data: creditCards = [], create, update, remove } = useCreditCards()
    const { data: expenses = [] } = useExpenses()
    const { user } = useAuth()
    const [editing, setEditing] = useState<CreditCard | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    if (!user) return <div className="panel">Please sign in to manage credit cards.</div>

    const handleCreate = (values: any) => {
        const cardData = {
            user_id: user.id,
            card_name: values.card_name,
            credit_limit: values.credit_limit,
            current_balance: values.current_balance,
            payment_method: values.payment_method,
            is_active: values.is_active
        }

        create.mutate(cardData)
        setShowForm(false)
    }

    const handleUpdate = (values: any) => {
        if (editing) {
            const patchData = {
                card_name: values.card_name,
                credit_limit: values.credit_limit,
                current_balance: values.current_balance,
                payment_method: values.payment_method,
                is_active: values.is_active
            }

            update.mutate({ id: editing.id, patch: patchData })
            setEditing(null)
        }
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this credit card?')) {
            remove.mutate(id)
        }
    }

    const handleCreatePayment = (values: any) => {
        const card = creditCards.find(c => c.id === values.credit_card_id)
        if (card) {
            // Reduce the balance by the payment amount
            const newBalance = Math.max(0, card.current_balance - values.amount)
            update.mutate({
                id: card.id,
                patch: {
                    current_balance: newBalance
                }
            })
        }
        setShowPaymentForm(false)
    }

    // Calculate utilization for each card
    const cardUtilizations = useMemo((): CreditCardUtilization[] => {
        return creditCards
            .filter(card => card.is_active)
            .map(card => calculateUtilization(card))
            .sort((a, b) => b.utilizationRate - a.utilizationRate) // Sort by highest utilization first
    }, [creditCards])

    const activeCards = creditCards.filter(card => card.is_active)
    const inactiveCards = creditCards.filter(card => !card.is_active)

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>💳 Credit Card Utilization</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowPaymentForm(true)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        💰 Record Payment
                    </button>
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
                        + Add Credit Card
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Add New Credit Card</h3>
                    {create.error && (
                        <div style={{
                            color: 'var(--error)',
                            backgroundColor: 'var(--error-bg)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            Error creating credit card: {String(create.error)}
                        </div>
                    )}
                    <CreditCardForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {editing && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Edit Credit Card</h3>
                    <CreditCardForm
                        initial={editing}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditing(null)}
                    />
                </div>
            )}

            {showPaymentForm && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Record Payment</h3>
                    <PaymentForm
                        onSubmit={handleCreatePayment}
                        onCancel={() => setShowPaymentForm(false)}
                        creditCards={activeCards}
                    />
                </div>
            )}


            {/* Utilization Overview */}
            {cardUtilizations.length > 0 && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>📊 Utilization Overview</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cardUtilizations.map((utilization) => (
                            <div key={utilization.card.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px',
                                border: `2px solid ${utilization.statusColor}`,
                                borderRadius: '12px',
                                backgroundColor: 'var(--panel)',
                                position: 'relative'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '24px',
                                            filter: utilization.status === 'poor' ? 'grayscale(1)' : 'none'
                                        }}>
                                            💳
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '18px' }}>
                                                {utilization.card.card_name}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                                {utilization.card.payment_method}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '24px',
                                        fontSize: '14px',
                                        color: 'var(--muted)'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '500' }}>Credit Limit:</span> ${utilization.card.credit_limit.toFixed(2)}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '500' }}>Current Balance:</span> ${utilization.card.current_balance.toFixed(2)}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '500' }}>Available:</span> ${utilization.availableCredit.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Show spending from expenses */}
                                    {(() => {
                                        const cardExpenses = expenses.filter(expense =>
                                            expense.payment_method === utilization.card.payment_method
                                        )
                                        const totalSpending = Math.abs(cardExpenses.reduce((sum, expense) => sum + expense.amount, 0))

                                        if (totalSpending > 0) {
                                            return (
                                                <div style={{
                                                    marginTop: '8px',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'var(--muted)',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    color: 'var(--text)'
                                                }}>
                                                    💡 <strong>Spending from expenses:</strong> ${totalSpending.toFixed(2)}
                                                    {totalSpending !== utilization.card.current_balance && (
                                                        <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>
                                                            (Balance manually set to ${utilization.card.current_balance.toFixed(2)})
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        }
                                        return null
                                    })()}
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: utilization.statusColor,
                                        marginBottom: '4px'
                                    }}>
                                        {utilization.utilizationRate.toFixed(1)}%
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: utilization.statusColor,
                                        fontWeight: '500'
                                    }}>
                                        {utilization.statusMessage}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    height: '6px',
                                    backgroundColor: 'var(--border)',
                                    borderRadius: '0 0 12px 12px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${Math.min(utilization.utilizationRate, 100)}%`,
                                        height: '100%',
                                        backgroundColor: utilization.statusColor,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                    <button
                                        onClick={() => setEditing(utilization.card)}
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
                                        onClick={() => handleDelete(utilization.card.id)}
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


            {/* Inactive Cards */}
            {inactiveCards.length > 0 && (
                <div className="panel">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>Inactive Cards</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {inactiveCards.map(card => (
                            <div key={card.id} style={{
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
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{card.card_name}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                        ${card.current_balance.toFixed(2)} / ${card.credit_limit.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => update.mutate({ id: card.id, patch: { is_active: true } })}
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
                                        onClick={() => handleDelete(card.id)}
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

            {creditCards.length === 0 && (
                <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>No credit cards added yet</h3>
                    <p style={{ margin: '0 0 20px 0', color: 'var(--muted)' }}>
                        Add your credit cards to track utilization rates and maintain good credit health.
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
                        Add Your First Credit Card
                    </button>
                </div>
            )}
        </div>
    )
}
