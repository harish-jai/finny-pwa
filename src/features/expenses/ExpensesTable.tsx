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
            <th>Date</th><th>Store</th><th>Description</th><th>Category</th><th>Amount</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{r.store}</td>
              <td>{r.description}</td>
              <td>{r.category}</td>
              <td>{r.amount.toFixed(2)}</td>
              <td style={{ textAlign:'right' }}>
                <button className="ghost" onClick={() => onEdit(r)}>Edit</button>{' '}
                <button className="ghost" onClick={() => onDelete(r)}>Delete</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} style={{ color:'var(--muted)' }}>No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
