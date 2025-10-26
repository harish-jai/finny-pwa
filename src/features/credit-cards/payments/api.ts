import { supabase } from '../../../lib/supabase'
import type { CreditCardPayment } from '../../../lib/types'

export async function listCreditCardPayments(): Promise<CreditCardPayment[]> {
    const { data, error } = await supabase
        .from('credit_card_payments')
        .select('*')
        .order('payment_date', { ascending: false })
    if (error) throw error
    return data as CreditCardPayment[]
}

export async function insertCreditCardPayment(payment: Partial<CreditCardPayment> & { user_id: string }): Promise<CreditCardPayment> {
    const { data, error } = await supabase
        .from('credit_card_payments')
        .insert(payment)
        .select()
        .single()
    if (error) throw error
    return data as CreditCardPayment
}

export async function updateCreditCardPayment(id: string, patch: Partial<CreditCardPayment>): Promise<CreditCardPayment> {
    const { data, error } = await supabase
        .from('credit_card_payments')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as CreditCardPayment
}

export async function deleteCreditCardPayment(id: string): Promise<void> {
    const { error } = await supabase
        .from('credit_card_payments')
        .delete()
        .eq('id', id)
    if (error) throw error
}
