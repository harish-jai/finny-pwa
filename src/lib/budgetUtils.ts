import { parseISO, startOfMonth, endOfMonth, differenceInDays } from 'date-fns'

export interface DailyBudgetInfo {
    dailyBudget: number
    totalBudget: number
    daysInMonth: number
    currentDay: number
    spentToday: number
    spentThisMonth: number
    availableToday: number
    rolloverAmount: number
    isOverBudget: boolean
    budgetUtilization: number
}

export function calculateDailyBudget(
    monthlyBudget: number,
    expenses: Array<{ date: string; amount: number }>,
    currentDate: Date = new Date()
): DailyBudgetInfo {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
    const currentDay = currentDate.getDate()

    const dailyBudget = monthlyBudget / daysInMonth

    // Filter expenses for current month
    const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date)
        return expenseDate >= monthStart && expenseDate <= monthEnd
    })

    const spentThisMonth = Math.abs(monthExpenses.reduce((sum, expense) => sum + expense.amount, 0))

    // Calculate rollover logic
    let rolloverAmount = 0
    let spentToday = 0

    // Calculate daily spending and rollover
    for (let day = 1; day <= currentDay; day++) {
        const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 23, 59, 59)

        const dayExpenses = monthExpenses.filter(expense => {
            const expenseDate = parseISO(expense.date)
            return expenseDate >= dayStart && expenseDate <= dayEnd
        })

        const daySpending = Math.abs(dayExpenses.reduce((sum, expense) => sum + expense.amount, 0))

        if (day === currentDay) {
            spentToday = daySpending
        }

        // Calculate rollover for this day
        const dailyAllowance = dailyBudget + rolloverAmount
        const dayRollover = dailyAllowance - daySpending

        if (dayRollover > 0) {
            rolloverAmount = dayRollover
        } else {
            rolloverAmount = 0
        }
    }

    const availableToday = dailyBudget + rolloverAmount - spentToday
    const isOverBudget = availableToday < 0
    const budgetUtilization = (spentThisMonth / monthlyBudget) * 100

    return {
        dailyBudget,
        totalBudget: monthlyBudget,
        daysInMonth,
        currentDay,
        spentToday,
        spentThisMonth,
        availableToday: Math.max(0, availableToday),
        rolloverAmount,
        isOverBudget,
        budgetUtilization
    }
}

export function formatBudgetStatus(budgetInfo: DailyBudgetInfo): string {
    const { availableToday, rolloverAmount, isOverBudget } = budgetInfo

    if (isOverBudget) {
        return `Over budget by $${Math.abs(availableToday).toFixed(2)} today`
    }

    if (rolloverAmount > 0) {
        return `$${availableToday.toFixed(2)} available today (includes $${rolloverAmount.toFixed(2)} rollover)`
    }

    return `$${availableToday.toFixed(2)} available today`
}

export function getBudgetStatusColor(budgetInfo: DailyBudgetInfo): string {
    const { isOverBudget, budgetUtilization } = budgetInfo

    if (isOverBudget) return 'var(--error)'
    if (budgetUtilization > 90) return 'var(--warning)'
    if (budgetUtilization > 80) return 'var(--warning)'
    return 'var(--success)'
}
