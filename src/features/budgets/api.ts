import { supabase } from '../../lib/supabase'
import type { Budget } from '../../lib/types'

export async function listBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
        .from('budgets')
        .select(`
      *,
      categories(name, icon, color)
    `)
        .order('budget_type', { ascending: true })
        .order('category', { ascending: true })
    if (error) throw error
    return data as Budget[]
}

export async function insertBudget(b: Partial<Budget> & { user_id: string }): Promise<Budget> {
    const { data, error } = await supabase
        .from('budgets')
        .insert(b)
        .select()
        .single()
    if (error) throw error
    return data as Budget
}

export async function updateBudget(id: string, patch: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
        .from('budgets')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Budget
}

export async function deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
    if (error) throw error
}
