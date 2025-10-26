import { useState } from 'react'
import { z } from 'zod'
import type { Budget } from '../../lib/types'
import { useCategories } from '../categories/useCategories'

const schema = z.object({
    budget_type: z.enum(['category', 'overall']),
    category_id: z.string().optional(),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    period: z.enum(['monthly', 'weekly', 'yearly']),
    is_active: z.boolean()
}).refine((data) => {
    if (data.budget_type === 'category') {
        return data.category_id && data.category_id.length > 0
    }
    return true
}, {
    message: "Category is required for category budgets",
    path: ["category_id"]
})

type FormValues = z.infer<typeof schema>

export default function BudgetForm({
    initial,
    onSubmit,
    onCancel,
}: {
    initial?: Partial<Budget>
    onSubmit: (values: FormValues) => void
    onCancel?: () => void
}) {
    const { data: categories = [] } = useCategories()

    const [values, setValues] = useState<FormValues>({
        budget_type: initial?.budget_type || 'category',
        category_id: initial?.category_id || '',
        amount: initial?.amount || 0,
        period: initial?.period || 'monthly',
        is_active: initial?.is_active ?? true
    })

    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const validated = schema.parse(values)
            setErrors({})
            onSubmit(validated)
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof FormValues, string>> = {}
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof FormValues] = err.message
                    }
                })
                setErrors(fieldErrors)
            }
        }
    }

    const handleChange = (field: keyof FormValues, value: string | number | boolean) => {
        setValues(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Budget Type
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="budget_type"
                            value="category"
                            checked={values.budget_type === 'category'}
                            onChange={(e) => handleChange('budget_type', e.target.value)}
                        />
                        <span>Category Budget</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="budget_type"
                            value="overall"
                            checked={values.budget_type === 'overall'}
                            onChange={(e) => handleChange('budget_type', e.target.value)}
                        />
                        <span>Overall Budget</span>
                    </label>
                </div>
            </div>

            {values.budget_type === 'category' && (
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                        Category
                    </label>
                    <select
                        value={values.category_id}
                        onChange={(e) => handleChange('category_id', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            backgroundColor: 'var(--panel)',
                            color: 'var(--text)'
                        }}
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && (
                        <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                            {errors.category_id}
                        </div>
                    )}
                </div>
            )}

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Amount
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                />
                {errors.amount && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.amount}
                    </div>
                )}
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Period
                </label>
                <select
                    value={values.period}
                    onChange={(e) => handleChange('period', e.target.value as 'monthly' | 'weekly' | 'yearly')}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    type="checkbox"
                    id="is_active"
                    checked={values.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    style={{ margin: 0 }}
                />
                <label htmlFor="is_active" style={{ color: 'var(--text)', cursor: 'pointer' }}>
                    Active budget
                </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    {initial ? 'Update Budget' : 'Create Budget'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
