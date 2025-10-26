import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Expense } from '../../lib/types'
import { useCreditCards } from '../credit-cards/useCreditCards'
import { useExpenses } from './useExpenses'
import { getPaymentMethodsFromExpenses } from '../../lib/creditCardUtils'

const schema = z.object({
    date: z.string().min(1),
    store: z.string().optional().nullable(),
    description: z.string().min(1),
    amount: z.coerce.number().min(0),
    category: z.string().min(1),
    payment_method: z.string().optional().nullable(),
    tags: z.string().optional(),            // comma-separated in the UI
    recurring: z.coerce.boolean().default(false),
    gift: z.string().optional().nullable(),
    girlfriendPct: z.coerce.number().min(0).max(100).default(0),
})

type FormValues = z.infer<typeof schema>

// Category options organized by group
const categoryOptions = [
    { group: 'Housing', options: ['Rent', 'Home Insurance', 'Utilities', 'Internet', 'Repairs'] },
    { group: 'Food', options: ['Groceries', 'Restaurants', 'Cafes', 'Fast Food', 'Delivery'] },
    { group: 'Transportation', options: ['Gas', 'Public Transit', 'Ride Shares', 'Parking', 'Vehicle Maintenance', 'Car Insurance'] },
    { group: 'Health', options: ['Health Insurance', 'Prescriptions', 'Medical Expenses', 'Fitness', 'Mental Health', 'Self-Care'] },
    { group: 'Subscriptions', options: ['Learning', 'Music', 'Streaming'] },
    { group: 'Clothing', options: ['Everyday Wear', 'Formal', 'Accessories', 'Shoes'] },
    { group: 'Savings', options: ['Roth IRA', 'CDs', 'HYSA', 'HSA/FSA'] },
    { group: 'Debt', options: ['Credit Card Payment', 'Personal Loan'] },
    { group: 'Uncategorized', options: ['Uncategorized'] },
]

// Base payment method options (always available)
const basePaymentMethodOptions = [
    'Cash',
    'Check',
    'Bank Transfer',
    'Gift Card',
    'Other',
]

export default function ExpenseForm({
    initial,
    onSubmit,
    onCancel,
}: {
    initial?: Partial<Expense>
    onSubmit: (values: FormValues) => void
    onCancel?: () => void
}) {
    const { data: creditCards = [] } = useCreditCards()
    const { data: expenses = [] } = useExpenses()

    // Get dynamic payment methods from credit cards and existing expenses
    const existingPaymentMethods = getPaymentMethodsFromExpenses(expenses)
    const creditCardPaymentMethods = creditCards
        .filter(card => card.is_active)
        .map(card => card.payment_method)

    // Combine all payment methods and remove duplicates
    const allPaymentMethods = Array.from(new Set([
        ...basePaymentMethodOptions,
        ...existingPaymentMethods,
        ...creditCardPaymentMethods
    ])).sort()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        // 👇 Cast fixes the "unknown" inference in older resolver typings
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: {
            date: initial?.date ?? new Date().toISOString().slice(0, 10),
            store: initial?.store ?? '',
            description: initial?.description ?? '',
            amount: initial?.amount ?? 0,
            category: initial?.category ?? '',
            payment_method: initial?.payment_method ?? '',
            tags: (initial?.tags ?? []).join(','),
            recurring: initial?.recurring ?? false,
            gift: initial?.gift ?? '',
            girlfriendPct: Math.round((initial?.girlfriend ?? 0) * 100),
        },
    })

    const onValid: SubmitHandler<FormValues> = (data) => {
        onSubmit(data)
    }

    return (
        <form className="panel" onSubmit={handleSubmit(onValid)}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', fontSize: '20px' }}>
                {initial ? '✏️ Edit Transaction' : '➕ Add New Transaction'}
            </h3>
            <div className="grid grid-2">
                <div>
                    <label>📅 Date</label>
                    <input type="date" {...register('date')} />
                </div>
                <div>
                    <label>💰 Amount</label>
                    <input type="number" step="0.01" placeholder="0.00" {...register('amount')} />
                </div>
            </div>

            <label>🏪 Store</label>
            <input placeholder="e.g., Target, Amazon, Local Market" {...register('store')} />

            <label>📝 Description</label>
            <input placeholder="What did you buy?" {...register('description')} />

            <div className="grid grid-2">
                <div>
                    <label>📂 Category</label>
                    <select {...register('category')}>
                        <option value="">Select a category</option>
                        {categoryOptions.map((group) => (
                            <optgroup key={group.group} label={group.group}>
                                {group.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                    <label>💳 Payment Method</label>
                    <select {...register('payment_method')}>
                        <option value="">Select payment method</option>
                        {allPaymentMethods.map((method) => {
                            const isCreditCard = creditCardPaymentMethods.includes(method)
                            return (
                                <option key={method} value={method}>
                                    {isCreditCard ? '💳 ' : ''}{method}
                                </option>
                            )
                        })}
                    </select>
                </div>
            </div>

            <label>🏷️ Tags (comma separated)</label>
            <input placeholder="groceries, essentials, work" {...register('tags')} />

            <div className="grid grid-2">
                <div>
                    <label>🎁 Gift (who for)</label>
                    <input placeholder="Mom / Friend / (empty)" {...register('gift')} />
                </div>
                <div>
                    <label>👫 GF %</label>
                    <input type="number" min={0} max={100} placeholder="0" {...register('girlfriendPct')} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <button type="submit" style={{ minHeight: '44px', flex: '1', minWidth: '120px' }}>
                    💾 Save Transaction
                </button>
                {onCancel && (
                    <button type="button" className="ghost" onClick={onCancel} style={{ minHeight: '44px', flex: '1', minWidth: '120px' }}>
                        ❌ Cancel
                    </button>
                )}
            </div>

            {Object.keys(errors).length > 0 && (
                <div className="error" style={{ marginTop: 16 }}>
                    <strong>Please fix the following errors:</strong>
                    {Object.entries(errors).map(([k, v]) => (
                        <div key={k}>• {k}: {v?.message || 'is invalid'}</div>
                    ))}
                </div>
            )}
        </form>
    )
}
