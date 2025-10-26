import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCreditCards, insertCreditCard, updateCreditCard, deleteCreditCard } from './api'
import type { CreditCard } from '../../lib/types'

export function useCreditCards() {
    const qc = useQueryClient()
    const q = useQuery({ queryKey: ['credit-cards'], queryFn: listCreditCards })

    const create = useMutation({
        mutationFn: (cc: Partial<CreditCard> & { user_id: string }) => insertCreditCard(cc),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] })
    })

    const update = useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: Partial<CreditCard> }) => updateCreditCard(id, patch),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] })
    })

    const remove = useMutation({
        mutationFn: (id: string) => deleteCreditCard(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] })
    })

    return { ...q, create, update, remove }
}
