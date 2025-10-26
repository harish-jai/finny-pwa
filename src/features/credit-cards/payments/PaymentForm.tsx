import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
    credit_card_id: z.string().min(1, 'Credit card is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required')
})

type FormValues = z.infer<typeof schema>

export default function PaymentForm({
    onSubmit,
    onCancel,
    creditCards = []
}: {
    onSubmit: (values: FormValues) => void
    onCancel?: () => void
    creditCards?: Array<{ id: string; card_name: string }>
}) {
    const [values, setValues] = useState<FormValues>({
        credit_card_id: '',
        amount: 0,
        description: ''
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

    const handleChange = (field: keyof FormValues, value: string | number) => {
        setValues(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Credit Card
                </label>
                <select
                    value={values.credit_card_id}
                    onChange={(e) => handleChange('credit_card_id', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                >
                    <option value="">Select credit card</option>
                    {creditCards.map(card => (
                        <option key={card.id} value={card.id}>{card.card_name}</option>
                    ))}
                </select>
                {errors.credit_card_id && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.credit_card_id}
                    </div>
                )}
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    Payment Amount
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="500.00"
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
                    Description
                </label>
                <input
                    type="text"
                    value={values.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Monthly payment, partial payment, etc."
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--panel)',
                        color: 'var(--text)'
                    }}
                />
                {errors.description && (
                    <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                        {errors.description}
                    </div>
                )}
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
                    Record Payment
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
