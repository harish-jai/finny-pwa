import { supabase } from '../../lib/supabase'
import type { Expense } from '../../lib/types'

export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000)
  if (error) throw error
  return data as Expense[]
}

export async function insertExpense(e: Partial<Expense> & { id: string; user_id: string }): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').insert(e).select().single()
  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, patch: Partial<Expense>): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}
