import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCreditCardPayments, insertCreditCardPayment, updateCreditCardPayment, deleteCreditCardPayment } from './api'
import type { CreditCardPayment } from '../../../lib/types'

export function useCreditCardPayments() {
    const qc = useQueryClient()
    const q = useQuery({ queryKey: ['credit-card-payments'], queryFn: listCreditCardPayments })

    const create = useMutation({
        mutationFn: (payment: Partial<CreditCardPayment> & { user_id: string }) => insertCreditCardPayment(payment),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credit-card-payments'] })
            qc.invalidateQueries({ queryKey: ['credit-cards'] }) // Refresh credit cards to update balances
        }
    })

    const update = useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: Partial<CreditCardPayment> }) => updateCreditCardPayment(id, patch),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credit-card-payments'] })
            qc.invalidateQueries({ queryKey: ['credit-cards'] })
        }
    })

    const remove = useMutation({
        mutationFn: (id: string) => deleteCreditCardPayment(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credit-card-payments'] })
            qc.invalidateQueries({ queryKey: ['credit-cards'] })
        }
    })

    return { ...q, create, update, remove }
}
