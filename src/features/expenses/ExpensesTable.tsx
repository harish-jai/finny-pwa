import type { Expense } from '../../lib/types'

export default function ExpensesTable({
  rows,
  onEdit,
  onDelete
}: {
  rows: Expense[]
  onEdit: (e: Expense) => void
  onDelete: (e: Expense) => void
}) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th><th>Store</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td data-label="Date">{r.date}</td>
              <td data-label="Store">{r.store || '—'}</td>
              <td data-label="Description">{r.description}</td>
              <td data-label="Category">
                <span style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {r.category}
                </span>
              </td>
              <td data-label="Amount" style={{ fontWeight: '600', color: 'var(--accent)' }}>
                ${r.amount.toFixed(2)}
              </td>
              <td>
                <div className="action-buttons">
                  <button className="ghost" onClick={() => onEdit(r)} style={{ fontSize: '12px', padding: '6px 10px' }}>
                    ✏️ Edit
                  </button>
                  <button className="ghost" onClick={() => onDelete(r)} style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                <div>No transactions yet.</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Add your first expense to get started!</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
