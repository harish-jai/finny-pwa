import { supabase } from '../../lib/supabase'
import type { CreditCard } from '../../lib/types'

export async function listCreditCards(): Promise<CreditCard[]> {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('card_name', { ascending: true })
    if (error) throw error
    return data as CreditCard[]
}

export async function insertCreditCard(cc: Partial<CreditCard> & { user_id: string }): Promise<CreditCard> {
    const { data, error } = await supabase
        .from('credit_cards')
        .insert(cc)
        .select()
        .single()
    if (error) throw error
    return data as CreditCard
}

export async function updateCreditCard(id: string, patch: Partial<CreditCard>): Promise<CreditCard> {
    const { data, error } = await supabase
        .from('credit_cards')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as CreditCard
}

export async function deleteCreditCard(id: string): Promise<void> {
    const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)
    if (error) throw error
}
