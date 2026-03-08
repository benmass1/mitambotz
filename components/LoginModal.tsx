
import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/backend/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      let text = '';
      try {
        text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error(`Server error: Invalid response format (${response.status})`);
      }
      
      if (!response.ok) {
        const errorMessage = data.error || `Login failed (${response.status}): ${text.substring(0, 50)}`;
        throw new Error(errorMessage);
      }

      localStorage.setItem('dr_mitambo_user', JSON.stringify(data.user));
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-neutral-900 border border-yellow-500/20 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">INGIA DR MITAMBO TZ</h2>
          <p className="text-gray-400 text-sm mt-2">Karibu tena! Ingiza barua pepe yako. <span className="text-xs text-gray-600">(v1.2)</span></p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barua Pepe (Email)</label>
            <input 
              type="email" 
              required
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="juma@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Neno la Siri (Password)</label>
            <input 
              type="password" 
              required
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="******"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'INAHAKIKI...' : 'INGIA SASA'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Hujajisajiri bado?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-yellow-500 font-bold hover:underline"
            >
              Jisajiri Hapa
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
