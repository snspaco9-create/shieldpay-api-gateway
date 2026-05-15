import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TransactionHistory({ token, refreshTrigger }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await axios.get('https://shieldpay-api-gateway.vercel.app/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.transactions)
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) return <div className="text-center py-8">Loading transactions...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>
  if (transactions.length === 0) return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <p className="text-gray-500">No transactions yet. Make a payment to get started!</p>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono">{tx.reference}</td>
              <td className="px-6 py-4 text-sm font-semibold">₦{tx.amount?.toLocaleString()}</td>
              <td className="px-6 py-4 text-sm">
                <div>{tx.customer_name}</div>
                <div className="text-xs text-gray-500">{tx.customer_email}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                  {tx.status?.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(tx.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}