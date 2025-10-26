export type Expense = {
  id: string
  user_id: string
  amount: number
  description: string
  category: string
  date: string            // ISO date 'YYYY-MM-DD'
  store: string | null
  payment_method: string | null
  tags: string[] | null
  recurring: boolean
  gift: string | null     // who it was for
  girlfriend: number      // 0..1
  created_at: string
  updated_at: string
}

export type Budget = {
  id: string
  user_id: string  // This will be a UUID string in TypeScript
  category_id: string | null  // References categories table (null for overall budgets)
  category: string | null  // Denormalized for easy querying (null for overall budgets)
  budget_type: 'category' | 'overall'  // Distinguishes between category and overall budgets
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreditCard = {
  id: string
  user_id: string
  card_name: string
  credit_limit: number
  current_balance: number
  payment_method: string  // References the payment method from expenses
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreditCardPayment = {
  id: string
  user_id: string
  credit_card_id: string
  amount: number  // Positive amount (payment made)
  payment_date: string  // ISO date 'YYYY-MM-DD'
  description: string
  payment_method: string  // How you paid (bank transfer, check, etc.)
  created_at: string
  updated_at: string
}
