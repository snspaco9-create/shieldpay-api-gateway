import { useState } from 'react';
import axios from 'axios';

export default function PaymentForm({ token, onSuccess }) {
  const [recipientUid, setRecipientUid] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await axios.post(
        'https://shieldpay-api-gateway.vercel.app/api/transfer/send',
        {
          recipient_uid: recipientUid,
          amount: parseFloat(amount),
          pin: pin
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess({
        message: response.data.msg,
        newBalance: response.data.new_balance,
        recipient: response.data.recipient
      });

      setRecipientUid('');
      setAmount('');
      setPin('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.msg || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

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
          <p>✅ {success.message}</p>
          <p className="text-sm mt-1">New balance: ₦{success.newBalance?.toLocaleString()}</p>
          <p className="text-sm">Sent to: {success.recipient}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Recipient UID</label>
          <input
            type="text"
            value={recipientUid}
            onChange={(e) => setRecipientUid(e.target.value.toUpperCase())}
            placeholder="e.g., SP123456"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

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

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Transaction PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Your 4‑6 digit transaction PIN"
            maxLength="6"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Send Money'}
        </button>
      </form>
    </div>
  );
}