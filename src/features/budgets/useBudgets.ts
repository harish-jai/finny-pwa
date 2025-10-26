import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBudgets, insertBudget, updateBudget, deleteBudget } from './api'
import type { Budget } from '../../lib/types'

export function useBudgets() {
    const qc = useQueryClient()
    const q = useQuery({ queryKey: ['budgets'], queryFn: listBudgets })

    const create = useMutation({
        mutationFn: (b: Partial<Budget> & { user_id: string }) => insertBudget(b),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
    })

    const update = useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: Partial<Budget> }) => updateBudget(id, patch),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
    })

    const remove = useMutation({
        mutationFn: (id: string) => deleteBudget(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
    })

    return { ...q, create, update, remove }
}
