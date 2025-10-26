import type { CreditCard, CreditCardPayment } from './types'
import type { Expense } from './types'

export interface CreditCardUtilization {
    card: CreditCard
    utilizationRate: number
    availableCredit: number
    status: 'excellent' | 'good' | 'poor'
    statusColor: string
    statusMessage: string
}

export function calculateUtilization(card: CreditCard): CreditCardUtilization {
    const utilizationRate = (card.current_balance / card.credit_limit) * 100
    const availableCredit = card.credit_limit - card.current_balance

    let status: 'excellent' | 'good' | 'poor'
    let statusColor: string
    let statusMessage: string

    if (utilizationRate < 10) {
        status = 'excellent'
        statusColor = 'var(--success)'
        statusMessage = 'Excellent utilization'
    } else if (utilizationRate < 30) {
        status = 'good'
        statusColor = 'var(--warning)'
        statusMessage = 'Good utilization'
    } else {
        status = 'poor'
        statusColor = 'var(--danger)'
        statusMessage = 'High utilization - pay down immediately'
    }

    return {
        card,
        utilizationRate,
        availableCredit,
        status,
        statusColor,
        statusMessage
    }
}

export function calculateCurrentBalanceFromExpenses(
    card: CreditCard
): number {
    // For now, return the manually set balance from the card
    // In a real app, you'd want to track payments and calculate net balance
    return card.current_balance
}

export function calculateNetBalance(
    card: CreditCard,
    expenses: Expense[],
    payments: CreditCardPayment[]
): number {
    // Calculate total charges from expenses
    const cardExpenses = expenses.filter(expense =>
        expense.payment_method === card.payment_method
    )
    const totalCharges = Math.abs(cardExpenses.reduce((sum, expense) => sum + expense.amount, 0))

    // Calculate total payments made to this card
    const cardPayments = payments.filter(payment =>
        payment.credit_card_id === card.id
    )
    const totalPayments = cardPayments.reduce((sum, payment) => sum + payment.amount, 0)

    // Net balance = charges - payments
    return Math.max(0, totalCharges - totalPayments)
}

export function getPaymentMethodsFromExpenses(expenses: Expense[]): string[] {
    const methods = new Set<string>()
    expenses.forEach(expense => {
        if (expense.payment_method) {
            methods.add(expense.payment_method)
        }
    })
    return Array.from(methods)
}
