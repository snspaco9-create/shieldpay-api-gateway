import { useState } from 'react'
import PaymentForm from './PaymentForm'
import TransactionHistory from './TransactionHistory'

export default function Dashboard({ token, setToken }) {
  const [activeTab, setActiveTab] = useState('pay')
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    window.location.href = '/login'
  }

  const handlePaymentSuccess = () => {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
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