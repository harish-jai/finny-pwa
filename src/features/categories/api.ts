import { supabase } from '../../lib/supabase'

export type Category = {
    id: string
    user_id: string | null
    name: string
    color: string
    icon: string | null
    parent_id: string | null
    is_default: boolean
    created_at: string
    updated_at: string
}

export async function listCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
    if (error) throw error
    return data as Category[]
}
