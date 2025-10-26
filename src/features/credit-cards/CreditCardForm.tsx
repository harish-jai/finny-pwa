import { useState } from 'react'
import { z } from 'zod'
import type { CreditCard } from '../../lib/types'
import { useExpenses } from '../expenses/useExpenses'
import { getPaymentMethodsFromExpenses } from '../../lib/creditCardUtils'

const schema = z.object({
    card_name: z.string().min(1, 'Card name is required'),
    credit_limit: z.number().min(1, 'Credit limit must be greater than 0'),
    current_balance: z.number().min(0, 'Current balance cannot be negative'),
    payment_method: z.string().min(1, 'Payment method is required'),
    is_active: z.boolean()
})

type FormValues = z.infer<typeof schema>

export default function CreditCardForm({
    initial,
    onSubmit,
    onCancel,
}: {
    initial?: Partial<CreditCard>
    onSubmit: (values: FormValues) => void
    onCancel?: () => void
}) {
    const { data: expenses = [] } = useExpenses()
    const paymentMethods = getPaymentMethodsFromExpenses(expenses)

    const [values, setValues] = useState<FormValues>({
        card_name: initial?.card_name || '',
        credit_limit: initial?.credit_limit || 0,
        current_balance: initial?.current_balance || 0,
        payment_method: initial?.payment_method || '',
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
                    Card Name
                </label>
                <input
                    type="text"
                    value={values.card_name}
                    onChange={(e) => handleChange('card_name', e.target.value)}
                    placeholder="e.g., Chase Sapphire Preferred"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                />
                {errors.card_name && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.card_name}
                    </div>
                )}
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Credit Limit
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.credit_limit}
                    onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
                    placeholder="5000"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                />
                {errors.credit_limit && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.credit_limit}
                    </div>
                )}
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Current Balance
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.current_balance}
                    onChange={(e) => handleChange('current_balance', parseFloat(e.target.value) || 0)}
                    placeholder="1200"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                />
                {errors.current_balance && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.current_balance}
                    </div>
                )}
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Payment Method
                </label>
                <select
                    value={values.payment_method}
                    onChange={(e) => handleChange('payment_method', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                >
                    <option value="">Select payment method</option>
                    {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
                {errors.payment_method && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.payment_method}
                    </div>
                )}
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
                    Active card
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
                    {initial ? 'Update Card' : 'Add Card'}
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
