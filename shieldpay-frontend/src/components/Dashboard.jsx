import { useState, useEffect } from 'react'
import axios from 'axios'
import PaymentForm from './PaymentForm'
import TransactionHistory from './TransactionHistory'

export default function Dashboard({ token, setToken }) {
  const [balance, setBalance] = useState(0)
  const [uid, setUid] = useState('')
  const [fullName, setFullName] = useState('')
  const [activeTab, setActiveTab] = useState('pay')
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [fundAmount, setFundAmount] = useState('')
  const [fundLoading, setFundLoading] = useState(false)
  const [fundMessage, setFundMessage] = useState('')

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await axios.get('https://shieldpay-api-gateway.vercel.app/api/transfer/balance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBalance(response.data.balance)
      setUid(response.data.uid)
      setFullName(response.data.full_name)
    } catch (err) {
      console.error('Failed to fetch balance', err)
    }
  }

  const handleFundWallet = async (e) => {
    e.preventDefault()
    setFundLoading(true)
    setFundMessage('')

    try {
      const response = await axios.post(
        'https://shieldpay-api-gateway.vercel.app/api/payments/fund',
        { amount: parseFloat(fundAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFundMessage(response.data.msg)
      setBalance(response.data.new_balance)
      setFundAmount('')
      setTimeout(() => setFundMessage(''), 3000)
    } catch (err) {
      setFundMessage(err.response?.data?.msg || 'Failed to fund wallet')
      setTimeout(() => setFundMessage(''), 3000)
    } finally {
      setFundLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    window.location.href = '/login'
  }

  const handlePaymentSuccess = () => {
    fetchBalance()
    setRefreshHistory(prev => prev + 1)
    setActiveTab('history')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛡️ ShieldPay</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome back, {fullName || 'User'}</h1>
        
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <p className="text-sm opacity-90">Your Balance</p>
          <p className="text-4xl font-bold">₦{balance.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-2">UID: {uid}</p>
        </div>

        {/* Fund Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Fund Wallet</h2>
          {fundMessage && (
            <div className={`mb-4 p-3 rounded ${fundMessage.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {fundMessage}
            </div>
          )}
          <form onSubmit={handleFundWallet} className="flex gap-4">
            <input
              type="number"
              placeholder="Amount (₦)"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
            <button
              type="submit"
              disabled={fundLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {fundLoading ? 'Processing...' : 'Add Funds'}
            </button>
          </form>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('pay')}
            className={`pb-2 px-4 ${activeTab === 'pay' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Make Payment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Transaction History
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'pay' ? (
          <PaymentForm token={token} onSuccess={handlePaymentSuccess} />
        ) : (
          <TransactionHistory token={token} refreshTrigger={refreshHistory} />
        )}
      </div>
    </div>
  )
}