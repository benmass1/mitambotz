
import React, { useState } from 'react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Technician',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/backend/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        const errorMessage = data.error || `Registration failed (${response.status}): ${text.substring(0, 50)}`;
        throw new Error(errorMessage);
      }

      // Save to local storage for persistence
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
          onClick={onSwitchToLogin}
          className="absolute top-4 left-4 text-gray-500 hover:text-white flex items-center space-x-1 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          <span className="text-xs font-bold uppercase tracking-widest">Rudi</span>
        </button>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">JIUNGE NA DR MITAMBO TZ</h2>
          <p className="text-gray-400 text-sm mt-2">Pata huduma kamili na uhifadhi historia yako.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jina Kamili</label>
            <input 
              type="text" 
              required
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="Mfano: Juma Kapuya"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barua Pepe (Email)</label>
            <input 
              type="email" 
              required
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="juma@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Neno la Siri (Password)</label>
            <input 
              type="password" 
              required
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="******"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Namba ya Simu</label>
            <input 
              type="tel" 
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              placeholder="+255 7..."
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cheo / Kazi</label>
            <select 
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors appearance-none"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="Technician">Technician (Fundi)</option>
              <option value="Operator">Operator (Dereva)</option>
              <option value="Manager">Manager (Meneja)</option>
              <option value="Student">Student (Mwanafunzi)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'INASAJILI...' : 'JISAJILI SASA'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Tayari una akaunti?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-yellow-500 font-bold hover:underline"
            >
              Ingia Hapa
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
