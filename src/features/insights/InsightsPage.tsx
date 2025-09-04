import { useExpenses } from '../expenses/useExpenses'
import { thisMonthRange, within, ym } from '../../lib/date'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts'

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0) }

export default function InsightsPage() {
    const { data = [] } = useExpenses()

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
            <div className="panel kpi">
                <div className="value">${Math.abs(thisMonthTotal).toFixed(2)}</div>
                <div className="label">Total spending this month</div>
            </div>

            <div className="panel" style={{ height: 280 }}>
                <h3>Totals by month</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={totalsByMonth}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="panel" style={{ height: 280 }}>
                <h3>Current month by category</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie data={byCategoryThisMonth} dataKey="total" nameKey="category" outerRadius={110} label />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
