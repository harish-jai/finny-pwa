import { useExpenses } from '../expenses/useExpenses'
import { useAuth } from '../../contexts/AuthContext'
import { thisMonthRange, within, ym } from '../../lib/date'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0) }

export default function InsightsPage() {
    const { data = [] } = useExpenses()
    const { user } = useAuth()

    if (!user) return <div className="panel">Please sign in to view insights.</div>

    const { start, end } = thisMonthRange()
    const monthRows = useMemo(() => data.filter(e => within(e.date, start, end)), [data, start, end])

    const thisMonthTotal = useMemo(() => sum(monthRows.map(e => e.amount)), [monthRows])

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

    return (
        <div className="grid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>📊 Insights</h2>
            </div>

            <div className="panel kpi">
                <div className="value">${Math.abs(thisMonthTotal).toFixed(2)}</div>
                <div className="label">Total spending this month</div>
            </div>

            <div className="panel" style={{ minHeight: 320 }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '18px' }}>📈 Monthly Spending Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={totalsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: 'var(--muted)' }}
                            axisLine={{ stroke: 'var(--border)' }}
                        />
                        <YAxis
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
                        <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

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
