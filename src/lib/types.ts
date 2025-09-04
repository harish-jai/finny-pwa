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
  