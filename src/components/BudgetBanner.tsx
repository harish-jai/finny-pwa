import { useMemo } from 'react'
import { useExpenses } from '../features/expenses/useExpenses'
import { useBudgets } from '../features/budgets/useBudgets'
import { calculateDailyBudget, formatBudgetStatus, getBudgetStatusColor, type DailyBudgetInfo } from '../lib/budgetUtils'

export default function BudgetBanner() {
    const { data: expenses = [] } = useExpenses()
    const { data: budgets = [] } = useBudgets()

    const budgetInfo = useMemo((): DailyBudgetInfo | null => {
        // Find active overall monthly budget
        const overallBudget = budgets.find(b =>
            b.is_active &&
            b.period === 'monthly' &&
            b.budget_type === 'overall'
        )

        if (!overallBudget) return null

        return calculateDailyBudget(overallBudget.amount, expenses)
    }, [budgets, expenses])

    if (!budgetInfo) return null

    const statusColor = getBudgetStatusColor(budgetInfo)
    const statusText = formatBudgetStatus(budgetInfo)

    return (
        <div style={{
            backgroundColor: budgetInfo.isOverBudget ? 'var(--error-bg)' : 'var(--success-bg)',
            border: `1px solid ${statusColor}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    fontSize: '24px',
                    filter: budgetInfo.isOverBudget ? 'grayscale(1)' : 'none'
                }}>
                    {budgetInfo.isOverBudget ? '🚨' : '💰'}
                </div>
                <div>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text)',
                        fontSize: '16px'
                    }}>
                        Daily Budget Tracker
                    </div>
                    <div style={{
                        color: statusColor,
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        {statusText}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                fontSize: '12px',
                color: 'var(--muted)',
                flexWrap: 'wrap'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                        ${budgetInfo.dailyBudget.toFixed(2)}
                    </div>
                    <div>Daily Budget</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                        ${budgetInfo.spentToday.toFixed(2)}
                    </div>
                    <div>Spent Today</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                        {budgetInfo.budgetUtilization.toFixed(0)}%
                    </div>
                    <div>Month Used</div>
                </div>

                {budgetInfo.rolloverAmount > 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: 'var(--success)' }}>
                            +${budgetInfo.rolloverAmount.toFixed(2)}
                        </div>
                        <div>Rollover</div>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '8px'
            }}>
                <div style={{
                    width: `${Math.min(budgetInfo.budgetUtilization, 100)}%`,
                    height: '100%',
                    backgroundColor: statusColor,
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    )
}
