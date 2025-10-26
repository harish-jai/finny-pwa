import { useExpenses } from '../expenses/useExpenses'
import { useBudgets } from '../budgets/useBudgets'
import { useAuth } from '../../contexts/AuthContext'
import { thisMonthRange, within, ym } from '../../lib/date'
import { useMemo, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Line, ComposedChart, CartesianGrid, Legend
} from 'recharts'

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0) }

export default function InsightsPage() {
    const { data = [] } = useExpenses()
    const { data: budgets = [] } = useBudgets()
    const { user } = useAuth()
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

    if (!user) return <div className="panel">Please sign in to view insights.</div>

    const { start, end } = thisMonthRange()
    const monthRows = useMemo(() => data.filter(e => within(e.date, start, end)), [data, start, end])

    const thisMonthTotal = useMemo(() => sum(monthRows.map(e => e.amount)), [monthRows])

    // Enhanced analytics calculations
    const totalsByMonth = useMemo(() => {
        const m = new Map<string, number>()
        for (const e of data) m.set(ym(e.date), (m.get(ym(e.date)) ?? 0) + e.amount)
        return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => ({ month: k, total: v }))
    }, [data])

    const byCategoryThisMonth = useMemo(() => {
        const m = new Map<string, number>()
        for (const e of monthRows) m.set(e.category, (m.get(e.category) ?? 0) + e.amount)
        return Array.from(m.entries()).map(([k, v]) => ({ category: k, total: v }))
    }, [monthRows])

    // Spending velocity analysis
    const spendingVelocity = useMemo(() => {
        const daysInMonth = new Date().getDate()
        const dailyAverage = Math.abs(thisMonthTotal) / daysInMonth
        const projectedMonthly = dailyAverage * 30

        return {
            dailyAverage: dailyAverage,
            projectedMonthly: projectedMonthly,
            daysInMonth: daysInMonth
        }
    }, [thisMonthTotal])

    // Payment method breakdown
    const paymentMethodBreakdown = useMemo(() => {
        const m = new Map<string, number>()
        for (const e of monthRows) {
            const method = e.payment_method || 'Unknown'
            m.set(method, (m.get(method) ?? 0) + e.amount)
        }
        return Array.from(m.entries()).map(([k, v]) => ({ method: k, total: v }))
    }, [monthRows])

    // Largest expenses
    const largestExpenses = useMemo(() => {
        return monthRows
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 10)
            .map(e => ({
                description: e.description,
                amount: Math.abs(e.amount),
                category: e.category,
                date: e.date
            }))
    }, [monthRows])

    // Category budgets using dynamic user budgets
    const categoryBudgets = useMemo(() => {
        const activeCategoryBudgets = budgets.filter(b =>
            b.is_active &&
            b.period === 'monthly' &&
            b.budget_type === 'category'
        )
        const budgetMap = new Map(activeCategoryBudgets.map(b => [b.category, b.amount]))

        return byCategoryThisMonth.map(cat => {
            const budget = budgetMap.get(cat.category) || 0
            return {
                category: cat.category,
                spent: cat.total,
                budget: budget,
                remaining: budget - cat.total,
                percentage: budget > 0 ? ((cat.total / budget) * 100) : 0
            }
        }).filter(cat => cat.budget > 0) // Only show categories with budgets
    }, [byCategoryThisMonth, budgets])

    // Overall budget
    const overallBudget = useMemo(() => {
        const activeOverallBudget = budgets.find(b =>
            b.is_active &&
            b.period === 'monthly' &&
            b.budget_type === 'overall'
        )
        return activeOverallBudget ? {
            budget: activeOverallBudget.amount,
            spent: Math.abs(thisMonthTotal),
            remaining: activeOverallBudget.amount - Math.abs(thisMonthTotal),
            percentage: (Math.abs(thisMonthTotal) / activeOverallBudget.amount) * 100
        } : null
    }, [budgets, thisMonthTotal])

    // Monthly spending trend with velocity
    const monthlyTrendWithVelocity = useMemo(() => {
        const months = totalsByMonth.slice(-6) // Last 6 months
        return months.map((month) => {
            const monthDate = new Date(month.month + '-01')
            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
            const dailyAverage = Math.abs(month.total) / daysInMonth

            return {
                ...month,
                dailyAverage: dailyAverage,
                daysInMonth: daysInMonth
            }
        })
    }, [totalsByMonth])

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>📊 Enhanced Insights</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['month', 'quarter', 'year'] as const).map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                backgroundColor: selectedPeriod === period ? 'var(--accent)' : 'transparent',
                                color: selectedPeriod === period ? 'white' : 'var(--text)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Enhanced KPI Row */}
            <div className="panel kpi">
                <div className="value">${Math.abs(thisMonthTotal).toFixed(2)}</div>
                <div className="label">Total spending this month</div>
            </div>

            <div className="panel kpi">
                <div className="value">${spendingVelocity.dailyAverage.toFixed(2)}</div>
                <div className="label">Daily average spending</div>
            </div>

            <div className="panel kpi">
                <div className="value">${spendingVelocity.projectedMonthly.toFixed(2)}</div>
                <div className="label">Projected monthly total</div>
            </div>

            {overallBudget && (
                <div className="panel kpi">
                    <div className="value" style={{
                        color: overallBudget.percentage > 100 ? 'var(--error)' :
                            overallBudget.percentage > 80 ? 'var(--warning)' : 'var(--success)'
                    }}>
                        {overallBudget.percentage.toFixed(0)}%
                    </div>
                    <div className="label">Budget utilization</div>
                </div>
            )}

            {/* Spending Velocity Chart */}
            <div className="panel" style={{ minHeight: 320 }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>⚡ Spending Velocity Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={monthlyTrendWithVelocity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: 'var(--muted)' }}
                            axisLine={{ stroke: 'var(--border)' }}
                        />
                        <YAxis
                            yAxisId="total"
                            tick={{ fontSize: 12, fill: 'var(--muted)' }}
                            axisLine={{ stroke: 'var(--border)' }}
                        />
                        <YAxis
                            yAxisId="velocity"
                            orientation="right"
                            tick={{ fontSize: 12, fill: 'var(--muted)' }}
                            axisLine={{ stroke: 'var(--border)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--panel)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text)'
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="total" dataKey="total" fill="var(--accent)" name="Monthly Total" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="velocity" type="monotone" dataKey="dailyAverage" stroke="#ff6b6b" strokeWidth={3} name="Daily Average" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Payment Method Breakdown */}
            <div className="panel" style={{ minHeight: 320 }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>💳 Payment Method Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={paymentMethodBreakdown}
                            dataKey="total"
                            nameKey="method"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            label={({ method, percent }) => `${method} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                            {paymentMethodBreakdown.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 60}, 70%, 60%)`} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--panel)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text)'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Overall Budget */}
            {overallBudget && (
                <div className="panel" style={{ minHeight: 320 }}>
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>🎯 Overall Budget</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text)' }}>Budget: ${overallBudget.budget.toFixed(2)}</span>
                            <span style={{ color: 'var(--text)' }}>Spent: ${overallBudget.spent.toFixed(2)}</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '20px',
                            backgroundColor: 'var(--border)',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${Math.min(overallBudget.percentage, 100)}%`,
                                height: '100%',
                                backgroundColor: overallBudget.percentage > 100 ? 'var(--error)' :
                                    overallBudget.percentage > 80 ? 'var(--warning)' : 'var(--success)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '14px',
                            color: 'var(--muted)'
                        }}>
                            {overallBudget.remaining >= 0
                                ? `$${overallBudget.remaining.toFixed(2)} remaining`
                                : `$${Math.abs(overallBudget.remaining).toFixed(2)} over budget`
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Category Budgets */}
            {categoryBudgets.length > 0 && (
                <div className="panel" style={{ minHeight: 320 }}>
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>🎯 Category Budgets</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={categoryBudgets} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                            <YAxis dataKey="category" type="category" tick={{ fontSize: 12, fill: 'var(--muted)' }} width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--panel)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--text)'
                                }}
                                formatter={(value, name) => [`$${value}`, name === 'spent' ? 'Spent' : 'Budget']}
                            />
                            <Bar dataKey="budget" fill="var(--muted)" name="Budget" />
                            <Bar dataKey="spent" fill="var(--accent)" name="Spent" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Largest Expenses */}
            <div className="panel" style={{ minHeight: 320 }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>💰 Largest Expenses This Month</h3>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {largestExpenses.map((expense, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: '500', color: 'var(--text)' }}>{expense.description}</div>
                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                    {expense.category} • {expense.date}
                                </div>
                            </div>
                            <div style={{
                                fontWeight: '600',
                                color: 'var(--accent)',
                                fontSize: '16px'
                            }}>
                                ${expense.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Original Category Pie Chart */}
            <div className="panel" style={{ minHeight: 320 }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>🥧 Spending by Category</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={byCategoryThisMonth}
                            dataKey="total"
                            nameKey="category"
                            outerRadius={100}
                            label={({ category, percent }) => `${category} ${((percent || 0) * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {byCategoryThisMonth.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 30}, 70%, 60%)`} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--panel)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text)'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
