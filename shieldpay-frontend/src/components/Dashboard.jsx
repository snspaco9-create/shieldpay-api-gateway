import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard({ token, setToken }) {
  const [balance, setBalance] = useState(0)
  const [uid, setUid] = useState('')
  const [fullName, setFullName] = useState('')
  const [activeTab, setActiveTab] = useState('send')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Form states
  const [recipientUid, setRecipientUid] = useState('')
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [fundAmount, setFundAmount] = useState('')

  useEffect(() => {
    fetchBalance()
    fetchTransactions()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transfer/balance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBalance(response.data.balance)
      setUid(response.data.uid)
      setFullName(response.data.full_name)
    } catch (err) {
      console.error('Failed to fetch balance', err)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.transactions)
    } catch (err) {
      console.error('Failed to fetch transactions', err)
    }
  }

  const handleFundWallet = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post(
        'http://localhost:5000/api/payments/fund',
        { amount: parseFloat(fundAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(response.data.msg)
      setBalance(response.data.new_balance)
      setFundAmount('')
      fetchTransactions()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fund wallet')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMoney = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post(
        'http://localhost:5000/api/transfer/send',
        {
          recipient_uid: recipientUid,
          amount: parseFloat(amount),
          pin: pin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(response.data.msg)
      setBalance(response.data.new_balance)
      setRecipientUid('')
      setAmount('')
      setPin('')
      fetchTransactions()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send money')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar with Logout */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🛡️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ShieldPay</h1>
                <p className="text-xs text-gray-500">Secure Payment Gateway</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Welcome,</p>
                <p className="font-semibold text-gray-800">{fullName}</p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🚪</div>
              <h2 className="text-xl font-bold text-gray-800">Confirm Logout</h2>
              <p className="text-gray-500 mt-2">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white transform hover:scale-[1.02] transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-4xl font-bold mt-1">₦{balance.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2 font-mono">UID: {uid}</p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-40">
            {message}
          </div>
        )}
        {error && (
          <div className="fixed top-24 right-6 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-40">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>💸</span>
            <span>Send Money</span>
          </button>
          <button
            onClick={() => setActiveTab('fund')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'fund'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>💳</span>
            <span>Fund Wallet</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📜</span>
            <span>History</span>
          </button>
        </div>

        {/* Send Money Tab */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send Money</h2>
            <form onSubmit={handleSendMoney}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Recipient UID</label>
                <input
                  type="text"
                  value={recipientUid}
                  onChange={(e) => setRecipientUid(e.target.value.toUpperCase())}
                  placeholder="e.g., SP123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                  min="1"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Transaction PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 4-6 digit PIN"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Money'}
              </button>
            </form>
          </div>
        )}

        {/* Fund Wallet Tab */}
        {activeTab === 'fund' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fund Wallet</h2>
            <form onSubmit={handleFundWallet}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Amount (₦)</label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                  min="1"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Fund Wallet'}
              </button>
            </form>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Send money or fund your wallet to see activity</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer/User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx, idx) => {
                      let isCredit = false
                      let isDebit = false
                      let displayName = tx.customer_name || '-'
                      
                      if (tx.type === 'transfer') {
                        if (tx.sender_id && tx.sender_id === tx.user_id) {
                          isDebit = true
                          displayName = `To: ${tx.recipient_name || 'User'}`
                        } else if (tx.recipient_id && tx.recipient_id === tx.user_id) {
                          isCredit = true
                          displayName = `From: ${tx.sender_name || 'User'}`
                        }
                      }
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            {isCredit && (
                              <div className="flex items-center gap-2">
                                <span className="text-green-500 text-xl">⬇️</span>
                                <span className="text-green-600 font-semibold text-sm">CREDIT</span>
                              </div>
                            )}
                            {isDebit && (
                              <div className="flex items-center gap-2">
                                <span className="text-red-500 text-xl">⬆️</span>
                                <span className="text-red-600 font-semibold text-sm">DEBIT</span>
                              </div>
                            )}
                            {!isCredit && !isDebit && (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-500 text-xl">💳</span>
                                <span className="text-blue-600 font-semibold text-sm">PAYMENT</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">{tx.reference?.slice(0, 20)}...</td>
                          <td className={`px-6 py-4 text-sm font-semibold ${isCredit ? 'text-green-600' : isDebit ? 'text-red-600' : 'text-gray-800'}`}>
                            {isCredit ? '+' : isDebit ? '-' : ''}₦{tx.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{displayName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                              {tx.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}