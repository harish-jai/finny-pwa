import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Expense } from '../../lib/types'

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

// Payment method options
const paymentMethodOptions = [
    'Bank of America Customized Cash Rewards',
    'Chase Debit Card',
    'Cash',
    'Gift Card',
    'Check',
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
            <div className="grid grid-2">
                <div>
                    <label>Date</label>
                    <input type="date" {...register('date')} />
                </div>
                <div>
                    <label>Amount</label>
                    <input type="number" step="0.01" {...register('amount')} />
                </div>
            </div>

            <label>Store</label>
            <input {...register('store')} />

            <label>Description</label>
            <input {...register('description')} />

            <div className="grid grid-2">
                <div>
                    <label>Category</label>
                    <select {...register('category')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#0f172a', color: 'var(--text)' }}>
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
                    <label>Payment Method</label>
                    <select {...register('payment_method')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#0f172a', color: 'var(--text)' }}>
                        <option value="">Select payment method</option>
                        {paymentMethodOptions.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <label>Tags (comma separated)</label>
            <input placeholder="groceries, essentials" {...register('tags')} />

            <div className="grid grid-2">
                <div>
                    <label>Gift (who for)</label>
                    <input placeholder="Mom / Friend / (empty)" {...register('gift')} />
                </div>
                <div>
                    <label>Girlfriend %</label>
                    <input type="number" min={0} max={100} {...register('girlfriendPct')} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit">Save</button>
                {onCancel && (
                    <button type="button" className="ghost" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ color: 'var(--danger)', marginTop: 8 }}>
                    {Object.entries(errors).map(([k]) => (
                        <div key={k}>{k} is invalid</div>
                    ))}
                </div>
            )}
        </form>
    )
}
