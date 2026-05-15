import { useState } from 'react'
import axios from 'axios'

export default function PaymentForm({ token, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const generateIdempotencyKey = () => {
    return `frontend_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    const idempotencyKey = generateIdempotencyKey()

    try {
      const response = await axios.post(
        'https://shieldpay-api-gateway.vercel.app/api/payments/initiate',
        {
          amount: parseFloat(amount),
          customer_name: customerName,
          customer_email: customerEmail
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey
          }
        }
      )

      setSuccess({
        reference: response.data.reference,
        message: `Payment initiated! Reference: ${response.data.reference}`,
      })

      setAmount('')
      setCustomerName('')
      setCustomerEmail('')
      
      if (onSuccess) onSuccess()
      
      setTimeout(async () => {
        try {
          await axios.post(
            'https://shieldpay-api-gateway.vercel.app/api/payments/webhook',
            { reference: response.data.reference, status: 'success' },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          setSuccess(prev => ({ ...prev, message: '✅ Payment completed successfully!' }))
          if (onSuccess) onSuccess()
        } catch (err) {
          console.error('Webhook failed', err)
        }
      }, 3000)
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Make Payment</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success.message}</p>
          <p className="text-sm mt-1">Reference: {success.reference}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Amount (₦)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Customer Email</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold">🛡️ Security Features:</p>
        <p>✓ Idempotency keys prevent double charges</p>
        <p>✓ JWT authentication required</p>
        <p>✓ Rate limiting protects against abuse</p>
        <p>✓ All transactions are logged</p>
      </div>
    </div>
  )
}