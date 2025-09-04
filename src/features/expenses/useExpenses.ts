import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, insertExpense, updateExpense, deleteExpense } from './api'
import type { Expense } from '../../lib/types'

export function useExpenses() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['expenses'], queryFn: listExpenses })

  const create = useMutation({
    mutationFn: (e: Partial<Expense> & { id: string; user_id: string }) => insertExpense(e),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] })
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Expense> }) => updateExpense(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] })
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] })
  })

  return { ...q, create, update, remove }
}
